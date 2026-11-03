"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/app/actions";
import { useI18n } from "./lang";

export function ContactForm({ withSubject, buttonLabel }: { withSubject?: boolean; buttonLabel?: string }) {
  const { t, lang } = useI18n();
  const [state, action, pending] = useActionState(sendContactMessage, null);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      <div className={`grid gap-5 ${withSubject ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <input name="name" required placeholder={withSubject ? t.form.name : t.form.nameShort} className="input" />
        {withSubject ? (
          <>
            <input name="email" type="email" required placeholder={t.form.email} className="input" />
            <input name="phone" required placeholder={t.form.phone} className="input" />
            <input name="subject" placeholder={t.form.subject} className="input" />
          </>
        ) : (
          <>
            <input name="phone" required placeholder={t.form.phoneShort} className="input" />
            <input name="email" type="email" required placeholder={t.form.emailShort} className="input" />
          </>
        )}
      </div>
      <textarea name="message" required rows={5} placeholder={withSubject ? t.form.message : t.form.messageShort} className="input resize-y" />
      {state && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className={`btn-dark ${withSubject ? "w-full" : "min-w-[200px]"}`}>
        {pending ? t.form.sending : (buttonLabel ?? t.form.submit)}
      </button>
    </form>
  );
}
