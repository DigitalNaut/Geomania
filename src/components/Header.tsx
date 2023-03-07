import type { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";

import { ReactComponent as Logo } from "src/assets/geomaniac-wordmark.svg";

type HeaderLinkProps = PropsWithChildren<{
  to: string;
}>;

const headerLinkBaseStyle = "flex items-center gap-1 px-3 py-1 rounded-full";
const headerLinkActiveStyle = "bg-slate-200 text-slate-900 hover:bg-slate-300";
const headerLinkInactiveStyle = "hover:bg-slate-700";

export function HeaderLink({ to, children }: HeaderLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `${headerLinkBaseStyle} ${
          isActive ? headerLinkActiveStyle : headerLinkInactiveStyle
        }`
      }
      to={to}
    >
      {children}
    </NavLink>
  );
}

type HeaderProps = PropsWithChildren<{
  className?: string;
  title?: string;
}>;

export default function Header({
  children,
  className,
  title,
}: HeaderProps): JSX.Element {
  return (
    <div
      className={`relative z-[1500] flex items-center gap-2 p-2 shadow-md ${className}`}
    >
      <Link to="/">
        <Logo title={title} />
      </Link>
      {children}
    </div>
  );
}
