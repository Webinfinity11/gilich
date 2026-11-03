import { deleteMessage, deleteSubscriber, markMessageRead } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "შეტყობინებები" };

export default async function MessagesPage() {
  await requireAdmin();
  const [messages, subscribers] = await Promise.all([
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.subscriber.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">შეტყობინებები</h1>
      <p className="mt-1 text-sm text-zinc-500">საკონტაქტო ფორმიდან გამოგზავნილი წერილები</p>

      <div className="mt-6 space-y-3">
        {messages.length === 0 && <p className="admin-card p-8 text-center text-sm text-zinc-500">შეტყობინებები ჯერ არ არის</p>}
        {messages.map((m) => (
          <article key={m.id} className={`admin-card p-5 ${m.read ? "" : "ring-2 !ring-zinc-900"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {m.name} {!m.read && <span className="ml-2 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-white">ახალი</span>}
                </p>
                <p className="text-sm text-zinc-500">
                  <a href={`mailto:${m.email}`} className="hover:underline">
                    {m.email}
                  </a>
                  {m.phone && (
                    <>
                      {" · "}
                      <a href={`tel:${m.phone}`} className="hover:underline">
                        {m.phone}
                      </a>
                    </>
                  )}
                </p>
              </div>
              <p className="text-xs text-zinc-500">{m.createdAt.toLocaleString("ka-GE")}</p>
            </div>
            {m.subject && <p className="mt-3 text-sm font-medium">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-700">{m.message}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <form action={markMessageRead.bind(null, m.id, !m.read)}>
                <button type="submit" className="hover:underline">
                  {m.read ? "წაუკითხავად მონიშვნა" : "წაკითხულად მონიშვნა"}
                </button>
              </form>
              <ConfirmButton action={deleteMessage.bind(null, m.id)}>წაშლა</ConfirmButton>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">გამომწერები ({subscribers.length})</h2>
      <p className="mt-1 text-sm text-zinc-500">newsletter-ის ფანჯრიდან</p>
      <div className="admin-card mt-4 divide-y divide-zinc-100">
        {subscribers.length === 0 && <p className="p-6 text-center text-sm text-zinc-500">გამომწერები ჯერ არ არის</p>}
        {subscribers.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <span>{s.email}</span>
            <span className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">{s.createdAt.toLocaleDateString("ka-GE")}</span>
              <ConfirmButton action={deleteSubscriber.bind(null, s.id)}>წაშლა</ConfirmButton>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
