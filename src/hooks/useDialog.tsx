import { type PropsWithChildren, type HTMLProps, useCallback, useState } from "react";

export function useDialog(initialContent: JSX.Element | null = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(initialContent);

  const openDialog = useCallback((content?: JSX.Element) => {
    if (content) setDialogContent(content);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  function Dialog({
    children,
    className,
    ...props
  }: PropsWithChildren<HTMLProps<HTMLDialogElement> & { className?: string }>) {
    if (!isOpen) return null;

    return (
      <dialog className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50" {...props}>
        <div className={`rounded-md bg-white p-4 text-slate-900 shadow-lg ${className}`}>{children}</div>
      </dialog>
    );
  }

  return { isOpen, dialogContent, openDialog, closeDialog, Dialog };
}
