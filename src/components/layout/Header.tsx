import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import LogoImage from "src/assets/images/geomaniac-wordmark.min.svg?react";
import { useHeaderControllerContext } from "src/contexts/HeaderControllerContext";

type HeaderProps = PropsWithChildren<{
  className?: string;
  title?: string;
}>;

function Nav({ children, className }: HeaderProps): JSX.Element {
  return (
    <nav className={twMerge("relative z-[1500] flex items-center gap-2 p-2 shadow-md", className)}>{children}</nav>
  );
}

type TitleProps = PropsWithChildren<{
  title: string;
}>;

Nav.Logo = function Logo({ title }: TitleProps) {
  const { onClickCallback } = useHeaderControllerContext();

  return (
    <Link
      to="/"
      onClick={() => {
        onClickCallback.current?.();
      }}
    >
      <LogoImage title={title} width={224} height={36} />
    </Link>
  );
};

const headerLinkBaseStyle = "flex items-center gap-1 px-3 py-1 border-b-2";
const headerLinkActiveStyle = "border-slate-200 text-slate-200";
const headerLinkInactiveStyle = "hover:border-slate-500 border-transparent";

type HeaderLinkProps = PropsWithChildren<{
  to: string;
  icon: IconDefinition;
}>;

Nav.Link = function Link({ to, children, icon }: HeaderLinkProps) {
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
};

export default Nav;
