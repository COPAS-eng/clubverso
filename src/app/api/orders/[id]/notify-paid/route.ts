import { NextRequest, NextResponse } from "next/server";
import { markCustomerReportedPaid, getOrderStatus, OrderNotFoundError } from "@/lib/order-service";
import { sendSms, adminPhones } from "@/lib/sms";
import { sendEmail, renderPaymentReportedEmail, notifyEmails } from "@/lib/email";
import { formatBRL } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await markCustomerReportedPaid(params.id);
    const order = await getOrderStatus(params.id);

    // Notificações ao vendedor (não bloqueiam a resposta se falharem)
    if (order) {
      const total = formatBRL(order.totalCents);
      const shortId = order.id.slice(0, 8);

      for (const phone of adminPhones()) {
        await sendSms(
          phone,
          `CLUBEVERSO: PIX avisado ${total} — pedido ${shortId} (${order.customerEmail}). Confira e confirme em /admin/pedidos.`
        ).catch((e) => console.error("sms notify fail", e));
      }

      for (const to of notifyEmails()) {
        const email = renderPaymentReportedEmail({
          orderId: order.id,
          totalCents: order.totalCents,
          customerEmail: order.customerEmail,
        });
        await sendEmail({ to, subject: email.subject, html: email.html }).catch((e) =>
          console.error("email notify fail", e)
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao registrar aviso de pagamento" }, { status: 500 });
  }
}