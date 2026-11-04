export const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const statusLabels: Record<string, string> = {
  pending: "New",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-zinc-200 text-zinc-600",
};

export const paymentLabels: Record<string, string> = {
  cod: "Cash on delivery",
  bank: "Bank transfer",
};
