"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPrimitive.Content className="w-full max-w-md rounded-3xl border bg-white shadow-soft p-5">
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
}

export function DialogHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
      {desc ? <DialogDescription className="text-sm text-neutral-500">{desc}</DialogDescription> : null}
    </div>
  );
}

