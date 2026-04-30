"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLog } from "@/app/api/log-actions";

export default function DeleteLogButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => deleteLog(id))}
      className="cursor-pointer rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-destructive disabled:pointer-events-none"
      aria-label="Delete log"
    >
      {pending
        ? <Loader2 className="size-3.5 animate-spin" />
        : <Trash2 className="size-3.5" />}
    </button>
  );
}
