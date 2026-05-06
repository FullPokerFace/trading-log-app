"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createIndicator,
  deleteIndicator,
  type IndicatorState,
  type TradeIndicator,
} from "@/app/api/indicator-actions";
import { Button } from "@/components/ui/button";
import IndicatorIcon from "@/components/indicator-icon";
import Text from "@/components/text";
import {
  defaultIndicatorIcon,
  indicatorIconOptions,
  type IndicatorIconName,
} from "@/lib/indicator-icons";
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  CircleX,
  Loader2,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

const initialState: IndicatorState = {};

function DeleteIndicatorButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteIndicator(id);
          router.refresh();
        });
      }}
      className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
      aria-label="Delete indicator"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </button>
  );
}

export default function TradeIndicatorsDialogClient({
  indicators,
}: {
  indicators: TradeIndicator[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createIndicator,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedIcon, setSelectedIcon] = useState<IndicatorIconName>(
    defaultIndicatorIcon
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <DialogRoot>
      <DialogTrigger
        render={
          <Button variant="outline">
            <SlidersHorizontal className="size-4" />
            Indicators
          </Button>
        }
      />

      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-primary" />
              <DialogTitle>Trade Indicators</DialogTitle>
            </div>
            <DialogClose
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </DialogClose>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {indicators.length === 0 ? (
                <Text
                  variant="subtitle"
                  className="rounded-lg border border-dashed border-input py-8 text-center"
                >
                  No indicators yet.
                </Text>
              ) : (
                <ul className="flex flex-col gap-2">
                  {indicators.map((indicator) => (
                    <li
                      key={indicator.id}
                      className="flex items-center gap-3 rounded-lg border border-input bg-background/40 px-3 py-2.5"
                    >
                      <IndicatorIcon name={indicator.icon} />
                      <p className="min-w-0 flex-1 break-words text-sm leading-6">
                        {indicator.label}
                      </p>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Checkbox
                      </span>
                      <DeleteIndicatorButton id={indicator.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form ref={formRef} action={formAction} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Text variant="subtitle" className="flex items-center gap-1.5">
                  <Plus className="size-4 text-muted-foreground" />
                  Add Indicator
                </Text>
                <input
                  name="label"
                  required
                  maxLength={100}
                  placeholder="Example: Did price respect VWAP?"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </div>

              <input type="hidden" name="icon" value={selectedIcon} />
              <div className="grid grid-cols-8 gap-1.5">
                {indicatorIconOptions.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    title={icon.label}
                    aria-label={icon.label}
                    aria-pressed={selectedIcon === icon.name}
                    onClick={() => setSelectedIcon(icon.name)}
                    className={`flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors hover:border-primary hover:text-primary ${selectedIcon === icon.name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground"
                      }`}
                  >
                    <IndicatorIcon name={icon.name} className="size-4" />
                  </button>
                ))}
              </div>

              {state.error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <CircleX className="size-4" />
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <DialogClose
                  render={
                    <Button variant="outline">
                      <X className="size-4" />
                      Close
                    </Button>
                  }
                />
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {pending ? "Saving..." : "Save Indicator"}
                </Button>
              </div>
            </form>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
