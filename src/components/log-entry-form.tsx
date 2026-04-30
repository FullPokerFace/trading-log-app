"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
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
  ImagePlus,
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
      { value: "Bullish", icon: <TrendingUp className="size-4 text-sky-400" />, color: "green" },
      { value: "Bearish", icon: <TrendingDown className="size-4 text-red-500" />, color: "red" },
    ],
  },
  {
    label: "Market Direction — 1hr candle",
    name: "direction1hr",
    legendIcon: <TrendingUp className="size-4 text-muted-foreground" />,
    options: [
      { value: "Bullish", icon: <TrendingUp className="size-4 text-sky-400" />, color: "green" },
      { value: "Bearish", icon: <TrendingDown className="size-4 text-red-500" />, color: "red" },
    ],
  },
  {
    label: "Option Purchased",
    name: "option",
    legendIcon: <TrendingUp className="size-4 text-muted-foreground" />,
    options: [
      { value: "CALL", icon: <TrendingUp className="size-4 text-sky-400" />, color: "green" },
      { value: "PUT", icon: <TrendingDown className="size-4 text-red-500" />, color: "red" },
    ],
  },
  {
    label: "Outcome",
    name: "outcome",
    legendIcon: <Trophy className="size-4 text-muted-foreground" />,
    options: [
      { value: "WIN", icon: <Trophy className="size-4 text-sky-400" />, color: "green" },
      { value: "LOSS", icon: <CircleX className="size-4 text-red-500" />, color: "red" },
    ],
  },
];

const checkedColors: Record<string, string> = {
  green: "has-[:checked]:border-sky-500 has-[:checked]:bg-sky-500/10 has-[:checked]:text-sky-400",
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
  const [, startTransition] = useTransition();
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (state.success) {
      closeRef.current?.click();
      setPreviews([]);
      setUploadedUrls([]);
    }
  }, [state.success]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...next]);
    setUploadedUrls([]);
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setUploadedUrls([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    let urls = uploadedUrls;

    if (previews.length > 0 && uploadedUrls.length === 0) {
      setUploading(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: previews.length }),
        });
        const data = await res.json() as {
          uploads?: { uploadURL: string; id: string }[];
          error?: string;
        };
        if (!data.uploads) throw new Error(data.error ?? "Upload failed");

        const uploadResults = await Promise.all(
          data.uploads.map(async ({ uploadURL }, i) => {
            const body = new FormData();
            body.append("file", previews[i].file);
            const res = await fetch(uploadURL, { method: "POST", body });
            const text = await res.text();
            console.log(`Upload ${i} status:`, res.status, text);
            return res;
          })
        );

        // uploadURL format: https://upload.imagedelivery.net/<account_hash>/<image_id>
        const accountHash = data.uploads[0].uploadURL.split("/")[3];
        urls = data.uploads.map(
          ({ id }) => `https://imagedelivery.net/${accountHash}/${id}/resize1080`
        );
        setUploadedUrls(urls);
      } catch (err) {
        console.error(err);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const fd = new FormData(formRef.current);
    urls.forEach((url) => fd.append("imageUrls", url));
    startTransition(() => formAction(fd));
  }

  const busy = pending || uploading;

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

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {/* Image upload */}
            <div className="flex flex-col gap-2">
              <Text variant="subtitle" className="flex items-center gap-1.5">
                <ImagePlus className="size-4 text-muted-foreground" />
                Screenshots (optional)
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previews.map((p, i) => (
                    <div key={p.url} className="relative size-20 rounded-md overflow-hidden border border-input">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-destructive hover:text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-20 rounded-md border border-dashed border-input flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
              )}

              {previews.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-input px-3 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="size-4" />
                  Add screenshots
                </button>
              )}
            </div>

            {state.error && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <CircleX className="size-4" />
                {state.error}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <DialogClose render={<Button variant="outline"><X className="size-4" />Cancel</Button>} />
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {uploading ? "Uploading…" : pending ? "Saving…" : "Save Entry"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
