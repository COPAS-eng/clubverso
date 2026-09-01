import QRCode from "qrcode";
import { buildPixPayload } from "./pix-br-code";
import type { PaymentGateway, PixChargeResult } from "./gateway";

const DEFAULT_EXPIRATION_SEC = 30 * 60;

/**
 * Gateway "PIX direto" — sem intermediário: o Copia-e-Cola aponta direto para a
 * chave PIX do dono do site (PIX_KEY). Não existe webhook de confirmação automática
 * (Nubank pessoa física não expõe essa API), então a confirmação é manual, feita
 * pelo admin em /admin/pedidos após conferir o extrato.
 */
export class DirectPixGateway implements PaymentGateway {
  async createPixCharge(input: {
    orderId: string;
    amountCents: number;
    customerEmail: string;
    expiresInSec?: number;
  }): Promise<PixChargeResult> {
    const pixKey = process.env.PIX_KEY?.trim();
    if (!pixKey) {
      throw new Error(
        "PIX_KEY não configurada. Defina sua chave PIX real (CPF, e-mail, telefone ou aleatória) em .env para gerar cobranças."
      );
    }
    const merchantName = process.env.PIX_MERCHANT_NAME || "CLUBEVERSO";
    const merchantCity = process.env.PIX_MERCHANT_CITY || "SAO PAULO";
    const txId = `CV${input.orderId}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25);

    const pixCopyPaste = buildPixPayload({
      pixKey,
      merchantName,
      merchantCity,
      amountCents: input.amountCents,
      txId,
    });
    const pixQrCode = await QRCode.toDataURL(pixCopyPaste, { margin: 1, width: 320 });
    const expiresAt = new Date(Date.now() + (input.expiresInSec ?? DEFAULT_EXPIRATION_SEC) * 1000);

    return { providerTxId: txId, pixQrCode, pixCopyPaste, expiresAt };
  }
}