"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLogEntry, type LogEntryState } from "@/app/api/log-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Trophy,
  CircleX,
  ShieldCheck,
  Save,
  Loader2,
} from "lucide-react";

const initialState: LogEntryState = {};

type RadioOption = {
  value: string;
  icon: React.ReactNode;
  color?: "green" | "red";
};

type FieldConfig = {
  label: string;
  name: string;
  legendIcon: React.ReactNode;
  options: RadioOption[];
};

const fields: FieldConfig[] = [
  {
    label: "Market Direction — 15m candle",
    name: "direction15m",
    legendIcon: <TrendingUp className="size-4 text-muted-foreground" />,
    options: [
      { value: "Bullish", icon: <TrendingUp className="size-4 text-blue-400" />, color: "green" },
      { value: "Bearish", icon: <TrendingDown className="size-4 text-red-500" />, color: "red" },
    ],
  },
  {
    label: "Market Direction — 1hr candle",
    name: "direction1hr",
    legendIcon: <TrendingUp className="size-4 text-muted-foreground" />,
    options: [
      { value: "Bullish", icon: <TrendingUp className="size-4 text-blue-400" />, color: "green" },
      { value: "Bearish", icon: <TrendingDown className="size-4 text-red-500" />, color: "red" },
    ],
  },
  {
    label: "Option Purchased",
    name: "option",
    legendIcon: <TrendingUp className="size-4 text-muted-foreground" />,
    options: [
      { value: "CALL", icon: <TrendingUp className="size-4 text-blue-400" />, color: "green" },
      { value: "PUT", icon: <TrendingDown className="size-4 text-red-500" />, color: "red" },
    ],
  },
  {
    label: "Outcome",
    name: "outcome",
    legendIcon: <Trophy className="size-4 text-muted-foreground" />,
    options: [
      { value: "WIN", icon: <Trophy className="size-4 text-blue-400" />, color: "green" },
      { value: "LOSS", icon: <CircleX className="size-4 text-red-500" />, color: "red" },
    ],
  },
];

const checkedColors: Record<string, string> = {
  green: "has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10 has-[:checked]:text-blue-400",
  red: "has-[:checked]:border-red-500   has-[:checked]:bg-red-500/10   has-[:checked]:text-red-600",
};

function RadioCard({
  name,
  value,
  icon,
  color,
  required,
}: {
  name: string;
  value: string;
  icon: React.ReactNode;
  color?: "green" | "red";
  required?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer rounded-lg border border-input px-3 py-2 text-sm transition-colors hover:bg-muted ${color ? checkedColors[color] : "has-[:checked]:border-primary has-[:checked]:bg-primary/5"}`}>
      <input type="radio" name={name} value={value} required={required} className="sr-only" />
      {icon}
      <span>{value}</span>
    </label>
  );
}

export default function LogEntryForm() {
  const [state, formAction, pending] = useActionState(createLogEntry, initialState);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.success) closeRef.current?.click();
  }, [state.success]);

  return (
    <DialogRoot>
      <DialogTrigger render={<Button><Plus className="size-4" />Add Log</Button>} />

      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <div className="flex items-center justify-between mb-5">
            <DialogTitle>New Log Entry</DialogTitle>
            <DialogClose ref={closeRef} className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="size-5" />
            </DialogClose>
          </div>

          <form action={formAction} className="flex flex-col gap-5">
            {fields.map((field) => (
              <fieldset key={field.name} className="flex flex-col gap-2 mt-6">
                <Text variant="subtitle" className="flex items-center gap-1.5">
                  {field.legendIcon}
                  {field.label}
                </Text>
                <div className="flex gap-2">
                  {field.options.map((opt) => (
                    <RadioCard
                      key={opt.value}
                      name={field.name}
                      value={opt.value}
                      icon={opt.icon}
                      color={opt.color}
                      required
                    />
                  ))}
                </div>
              </fieldset>
            ))}

            <Checkbox
              name="confirmedConditions"
              label="Confirmed all entry conditions"
              icon={<ShieldCheck className="size-4 text-muted-foreground" />}
            />

            {state.error && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <CircleX className="size-4" />
                {state.error}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <DialogClose render={<Button variant="outline"><X className="size-4" />Cancel</Button>} />
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {pending ? "Saving…" : "Save Entry"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
