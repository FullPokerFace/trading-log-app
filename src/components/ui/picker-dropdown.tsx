"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type PickerOption<TValue extends string> = {
  value: TValue;
  label: string;
  icon?: React.ReactNode;
};

export default function PickerDropdown<TValue extends string>({
  value,
  options,
  onChange,
  label = "Select",
  triggerLabel,
  triggerIcon,
  renderOption,
  className,
  menuClassName,
  optionListClassName,
  optionClassName,
}: {
  value: TValue;
  options: PickerOption<TValue>[];
  onChange: (value: TValue) => void;
  label?: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  renderOption?: (option: PickerOption<TValue>) => React.ReactNode;
  className?: string;
  menuClassName?: string;
  optionListClassName?: string;
  optionClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !ref.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        minWidth: rect.width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const menu = open && (
    <div
      ref={menuRef}
      className={cn(
        "z-100 mt-0 max-h-60 min-w-44 overflow-y-auto rounded-lg border border-input bg-popover p-1 shadow-xl",
        menuClassName
      )}
      style={menuStyle}
      role="listbox"
      aria-label={label}
    >
      <div className={optionListClassName}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            title={option.label}
            aria-label={option.label}
            aria-selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
              option.value === value && "bg-primary/10 text-primary",
              optionClassName
            )}
          >
            {renderOption ? (
              renderOption(option)
            ) : (
              <>
                {option.icon}
                <span className="min-w-0 truncate">{option.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors hover:border-primary focus:border-ring focus:ring-3 focus:ring-ring/50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {triggerIcon ?? selected.icon}
          <span>{triggerLabel ?? selected.label}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
