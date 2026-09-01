"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ConfirmButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}/confirm`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erro ao confirmar pagamento");
    }
  }

  return (
    <Button onClick={confirmar} disabled={loading}>
      {loading ? "Confirmando..." : "Marcar como pago"}
    </Button>
  );
}