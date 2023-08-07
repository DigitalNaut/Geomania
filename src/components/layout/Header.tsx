import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { ReactComponent as Logo } from "src/assets/images/geomaniac-wordmark.min.svg";

type HeaderLinkProps = PropsWithChildren<{
  to: string;
  icon: IconDefinition;
}>;

const headerLinkBaseStyle = "flex items-center gap-1 px-3 py-1 border-b-2";
const headerLinkActiveStyle = "border-slate-200 text-slate-200";
const headerLinkInactiveStyle = "hover:border-slate-500 border-transparent";

export function HeaderLink({ to, children, icon }: HeaderLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `${headerLinkBaseStyle} ${isActive ? headerLinkActiveStyle : headerLinkInactiveStyle}`
      }
      to={to}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </NavLink>
  );
}

type HeaderProps = PropsWithChildren<{
  className?: string;
  title?: string;
}>;

export default function Header({ children, className, title }: HeaderProps): JSX.Element {
  return (
    <div className={twMerge("relative z-[1500] flex items-center gap-2 p-2 shadow-md", className)}>
      <Link to="/">
        <Logo title={title} width={224} height={36} />
      </Link>
      {children}
    </div>
  );
}
