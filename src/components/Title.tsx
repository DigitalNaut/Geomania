import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Header({ children, className }: Props): JSX.Element {
  return (
    <div
      className={`font-paytone h-fit max-w-full flex-[0] bg-green-800 p-2 text-3xl uppercase text-white shadow-lg drop-shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
