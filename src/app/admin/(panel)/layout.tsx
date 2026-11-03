import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-60">
      <Suspense>
        <AdminSidebar />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <Suspense fallback={<div className="py-20 text-center text-sm text-zinc-500">იტვირთება...</div>}>{children}</Suspense>
      </main>
    </div>
  );
}
