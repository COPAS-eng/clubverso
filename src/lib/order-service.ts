import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatEditionCode } from "@/lib/edition-code";
import { DirectPixGateway } from "@/lib/payments/pix-direct-adapter";
import { generatePersonalizedPdf } from "@/lib/pdf";
import { putObject } from "@/lib/storage";

export class SoldOutError extends Error {
  constructor() {
    super("Edição esgotada");
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Pedido não encontrado");
  }
}

const gateway = new DirectPixGateway();

interface CreateOrderInput {
  workSlug: string;
  customerEmail: string;
  customerName?: string;
  gift?: { recipientEmail: string };
}

export async function createOrderWithPix(input: CreateOrderInput) {
  const work = await prisma.work.findUnique({ where: { slug: input.workSlug } });
  if (!work) throw new Error("Obra não encontrada");
  if (work.issuedCount >= work.maxSupply) throw new SoldOutError();

  const items = [{ workId: work.id, priceCents: work.priceCents, isGift: false }];
  if (input.gift) {
    items.push({ workId: work.id, priceCents: work.secondPriceCents, isGift: true });
  }
  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

  const order = await prisma.order.create({
    data: {
      status: "PENDING",
      totalCents,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      items: { create: items },
    },
    include: { items: true },
  });

  const charge = await gateway.createPixCharge({
    orderId: order.id,
    amountCents: totalCents,
    customerEmail: input.customerEmail,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "PIX_DIRECT",
      providerTxId: charge.providerTxId,
      amountCents: totalCents,
      pixQrCode: charge.pixQrCode,
      pixCopyPaste: charge.pixCopyPaste,
      status: "PENDING",
    },
  });

  if (input.gift) {
    const giftItem = order.items.find((i: any) => i.isGift)!;
    await prisma.gift.create({
      data: { orderId: order.id, orderItemId: giftItem.id, recipientEmail: input.gift.recipientEmail },
    });
  }

  return {
    orderId: order.id,
    totalCents,
    expiresAt: charge.expiresAt,
    pixQrCode: charge.pixQrCode,
    pixCopyPaste: charge.pixCopyPaste,
  };
}

export async function getOrderStatus(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      items: { include: { work: true, edition: true } },
    },
  });
}

export async function markCustomerReportedPaid(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) throw new OrderNotFoundError();
  await prisma.payment.update({ where: { orderId }, data: { customerReportedPaidAt: new Date() } });
}

/**
 * Transação atômica que atribui edições numeradas — equivalente ao que um
 * webhook de gateway faria, mas disparada manualmente pelo admin após conferir
 * o pagamento PIX direto no extrato do Nubank. Idempotente: se o pedido já
 * está PAID, retorna sem duplicar.
 */
export async function confirmOrderPayment(orderId: string, actor: { email: string }) {
  try {
    return await prisma.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true, payment: true },
        });
        if (!order) throw new OrderNotFoundError();
        if (order.status === "PAID") return order;
        if (!order.payment) throw new Error("Pedido sem pagamento associado");

        for (const item of order.items) {
          const work = await tx.work.findUniqueOrThrow({
            where: { id: item.workId },
            include: { club: true },
          });
          const issued = await tx.edition.count({ where: { workId: item.workId } });
          if (issued >= work.maxSupply) throw new SoldOutError();

          const nextNumber = issued + 1;
          const code = formatEditionCode(work.club.shortCode, work.periodEnd, nextNumber);

          const edition = await tx.edition.create({
            data: {
              workId: item.workId,
              editionNumber: nextNumber,
              editionCode: code,
              ownerId: item.isGift ? null : order.userId ?? null,
              orderItemId: item.id,
              status: "ASSIGNED",
            },
          });

          await tx.work.update({ where: { id: item.workId }, data: { issuedCount: { increment: 1 } } });

          const gift = await tx.gift.findUnique({ where: { orderItemId: item.id } });
          if (gift) {
            await tx.gift.update({ where: { id: gift.id }, data: { editionId: edition.id } });
          }

          await tx.certificate.create({
            data: {
              editionId: edition.id,
              data: {
                workTitle: work.title,
                editionNumber: nextNumber,
                editionCode: code,
                maxSupply: work.maxSupply,
                editorialClosedAt: work.editorialClosedAt,
              } as any,
            },
          });

          await tx.auditLog.create({
            data: {
              actorEmail: actor.email,
              action: "EDITION_ASSIGNED",
              entity: "Edition",
              entityId: edition.id,
              metadata: { code, number: nextNumber, orderId } as any,
            },
          });

          // Gerar PDF personalizado com selo de autenticidade
          const { buffer, key } = await generatePersonalizedPdf({
            workTitle: work.title,
            editionNumber: nextNumber,
            maxSupply: work.maxSupply,
            editionCode: code,
            clubName: work.club.name,
          });
          await tx.edition.update({
            where: { id: edition.id },
            data: { personalizedPdfUrl: key },
          });
        }

        const updatedOrder = await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
        await tx.payment.update({
          where: { orderId },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
await tx.auditLog.create({
            data: {
              actorEmail: actor.email,
              action: "PAYMENT_CONFIRMED_MANUAL",
              entity: "Order",
              entityId: orderId,
              metadata: { totalCents: order.totalCents } as any,
            },
          });

        return updatedOrder;
      },
      { isolationLevel: "Serializable" as any, maxWait: 5000, timeout: 10000 }
    );
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error("Conflito ao atribuir edição — tente confirmar novamente.");
    }
    throw err;
  }
}