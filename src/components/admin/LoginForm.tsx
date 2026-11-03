"use client";

import { use, useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = use(searchParams);
  const next = typeof params.next === "string" ? params.next : "/admin";
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm">
        ელფოსტა
        <input name="email" type="email" required autoComplete="username" className="admin-input mt-1" />
      </label>
      <label className="block text-sm">
        პაროლი
        <input name="password" type="password" required autoComplete="current-password" className="admin-input mt-1" />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="admin-btn w-full">
        {pending ? "..." : "შესვლა"}
      </button>
    </form>
  );
}
