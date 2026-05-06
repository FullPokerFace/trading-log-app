"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createLogEntry, type LogEntryState } from "@/app/api/log-actions";
import { type TradeIndicator } from "@/app/api/indicator-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import IndicatorIcon from "@/components/indicator-icon";
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
  CircleX,
  Save,
  Loader2,
  ImagePlus,
  ArrowUpFromLine,
  ArrowDownToLine,
  Hash,
} from "lucide-react";

const initialState: LogEntryState = {};

export default function LogEntryFormClient({
  indicators,
}: {
  indicators: TradeIndicator[];
}) {
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
      const timeout = window.setTimeout(() => {
        setPreviews((prev) => {
          prev.forEach((preview) => URL.revokeObjectURL(preview.url));
          return [];
        });
        setUploadedUrls([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 0);

      return () => window.clearTimeout(timeout);
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

        await Promise.all(
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
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Text variant="subtitle" className="flex items-center gap-1.5">
                  <ArrowUpFromLine className="size-4 text-sky-400" />
                  Entry Price
                </Text>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    name="entryPrice"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-input bg-background pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Text variant="subtitle" className="flex items-center gap-1.5">
                  <ArrowDownToLine className="size-4 text-red-400" />
                  Exit Price
                </Text>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    name="exitPrice"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-input bg-background pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Text variant="subtitle" className="flex items-center gap-1.5">
                  <Hash className="size-4 text-muted-foreground" />
                  Contracts
                </Text>
                <input
                  type="number"
                  name="contracts"
                  step="1"
                  min="1"
                  placeholder="1"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {indicators.length > 0 && (
              <fieldset>
                <div className="grid gap-2 sm:grid-cols-1">
                  {indicators.map((indicator) => (
                    <div key={indicator.id}>
                      <input type="hidden" name="indicatorIds" value={indicator.id} />
                      <Checkbox
                        name="checkedIndicators"
                        value={indicator.id}
                        label={indicator.label}
                        icon={<IndicatorIcon name={indicator.icon} />}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            )}

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
                {uploading ? "Uploading..." : pending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
