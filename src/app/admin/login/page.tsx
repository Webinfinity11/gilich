import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { site } from "@/lib/site";

export const metadata = { title: "შესვლა" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.logo} alt={site.fullName} className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center text-lg font-semibold">ადმინ პანელი</h1>
        <Suspense>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
