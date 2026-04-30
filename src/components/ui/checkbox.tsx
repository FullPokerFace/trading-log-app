import { cn } from "@/lib/utils";

interface CheckboxProps extends React.ComponentProps<"input"> {
  label: string;
  icon?: React.ReactNode;
}

export function Checkbox({ label, icon, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 cursor-pointer rounded-lg border border-input px-3 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 hover:bg-muted",
        className
      )}
    >
      <input type="checkbox" className="sr-only" {...props} />
      <span className="size-4 shrink-0 rounded-full border-2 border-input transition-colors has-[:checked]:border-primary [label:has(:checked)_&]:border-primary [label:has(:checked)_&]:bg-primary" />
      {icon}
      <span>{label}</span>
    </label>
  );
}
