"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogClose,
} from "@/components/ui/dialog";

export default function ImageLightbox({ urls }: { urls: string[] }) {
  const [selected, setSelected] = useState(0);

  if (urls.length === 0) return null;

  return (
    <DialogRoot>
      <div className="flex gap-1.5 flex-wrap">
        {urls.map((url, i) => (
          <DialogTrigger
            key={url}
            render={
              <button
                type="button"
                onClick={() => setSelected(i)}
                className="size-10 rounded overflow-hidden border border-input hover:border-sky-500 transition-colors shrink-0"
              />
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
          </DialogTrigger>
        ))}
      </div>

      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="bg-transparent ring-0 shadow-none p-6 max-w-[90vw] w-auto overflow-y-visible">
          <div className="relative">
            <DialogClose className="absolute -top-3 -right-3 z-10 rounded-full bg-card p-1 text-muted-foreground hover:text-foreground ring-1 ring-foreground/10 cursor-pointer">
              <X className="size-4" />
            </DialogClose>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[selected]}
              alt=""
              className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain"
            />
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
