"use client";

import { useTransition } from "react";

export function DeleteButton({
  id,
  onDelete,
}: {
  id: number;
  onDelete: (id: number) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await onDelete(id);
          window.location.href = "/";
        });
      }}
      className="w-full cursor-pointer rounded-full border border-red-400/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-300 hover:bg-red-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete image"}
    </button>
  );
}
