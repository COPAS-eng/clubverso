// Abstração de gateway de pagamento (ADR-004) — permite trocar a implementação
// (ex.: PIX direto → EFI/Mercado Pago) sem reescrever o domínio.

export interface PixChargeResult {
  providerTxId: string;
  pixQrCode: string; // data URL (PNG base64)
  pixCopyPaste: string;
  expiresAt: Date;
}

export interface PaymentGateway {
  createPixCharge(input: {
    orderId: string;
    amountCents: number;
    customerEmail: string;
    expiresInSec?: number;
  }): Promise<PixChargeResult>;
}