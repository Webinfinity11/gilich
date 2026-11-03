"use client";

import { useState, useTransition } from "react";

/** Two-step destructive button: first click arms it, second click runs the action */
export function ConfirmButton({
  action,
  children,
  confirmLabel = "დარწმუნებული ხართ?",
  className = "text-sm text-red-600 hover:underline",
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) return setArmed(true);
        startTransition(async () => {
          await action();
          setArmed(false);
        });
      }}
    >
      {pending ? "..." : armed ? confirmLabel : children}
    </button>
  );
}
