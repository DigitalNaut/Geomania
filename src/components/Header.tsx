import type { PropsWithChildren } from "react";

// TODO: Fix this import to work with svgr when that's fixed
import Logo from "/src/assets/geomania.svg";

type Props = PropsWithChildren & {
  className?: string;
  title?: string;
};

export default function Header({
  children,
  className,
  title,
}: Props): JSX.Element {
  return (
    <div
      className={`font-paytone flex h-fit max-w-full flex-[0] gap-1 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-800 p-2 text-3xl uppercase text-white shadow-md ${className}`}
    >
      {/* <Logo /> */}
      <img src={Logo} title={title} />
      {children}
    </div>
  );
}
