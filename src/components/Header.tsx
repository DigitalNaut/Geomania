import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Header({ children, className }: Props): JSX.Element {
  return (
    <div
      className={`font-paytone h-fit max-w-full flex-[0] bg-gradient-to-br from-green-700 to-green-800 p-2 text-3xl uppercase text-white shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
