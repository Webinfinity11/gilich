"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, statusColors, statusLabels } from "@/lib/orders";

export function OrderStatusSelect({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm">
      Status:
      <select
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => updateOrderStatus(id, next));
        }}
        className={`rounded-lg border-0 px-3 py-2 text-sm font-medium ring-1 ring-zinc-200 ${statusColors[status] ?? ""}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </select>
      {pending && <span className="text-zinc-500">...</span>}
    </label>
  );
}
