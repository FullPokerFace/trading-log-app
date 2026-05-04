"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRule, deleteRule, type RuleState, type TradingRule } from "@/app/api/rule-actions";
import { Button } from "@/components/ui/button";
import Text from "@/components/text";
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { BookOpenCheck, CircleX, Loader2, Plus, Save, Trash2, X } from "lucide-react";

const initialState: RuleState = {};

function DeleteRuleButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteRule(id);
          router.refresh();
        });
      }}
      className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
      aria-label="Delete rule"
    >
      {pending
        ? <Loader2 className="size-3.5 animate-spin" />
        : <Trash2 className="size-3.5" />}
    </button>
  );
}

export default function TradingRulesDialogClient({ rules }: { rules: TradingRule[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRule, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline"><BookOpenCheck className="size-4" />Rules</Button>} />

      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="size-5 text-primary" />
              <DialogTitle>Trading Rules</DialogTitle>
            </div>
            <DialogClose className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="size-5" />
            </DialogClose>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {rules.length === 0 ? (
                <Text variant="subtitle" className="rounded-lg border border-dashed border-input py-8 text-center">
                  No rules yet.
                </Text>
              ) : (
                <ol className="flex flex-col gap-2">
                  {rules.map((rule, index) => (
                    <li
                      key={rule.id}
                      className="flex items-start gap-3 rounded-lg border border-input bg-background/40 px-3 py-2.5"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-6">
                        {rule.text}
                      </p>
                      <DeleteRuleButton id={rule.id} />
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <form ref={formRef} action={formAction} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Text variant="subtitle" className="flex items-center gap-1.5">
                  <Plus className="size-4 text-muted-foreground" />
                  Add Rule
                </Text>
                <textarea
                  name="text"
                  required
                  maxLength={500}
                  rows={4}
                  placeholder="Example: Only enter after the 15m and 1hr trend agree."
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </div>

              {state.error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <CircleX className="size-4" />
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <DialogClose render={<Button variant="outline"><X className="size-4" />Close</Button>} />
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {pending ? "Saving..." : "Save Rule"}
                </Button>
              </div>
            </form>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
