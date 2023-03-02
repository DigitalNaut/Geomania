import type { PropsWithChildren } from "react";

// TODO: Fix this import to work with svgr when that's fixed
import Logo from "src/assets/geomania.svg";
import { useUser } from "src/hooks/UserContext";

type Props = PropsWithChildren & {
  className?: string;
  title?: string;
};

export default function Header({
  children,
  className,
  title,
}: Props): JSX.Element {
  const { user, LoginButton, UserCard, LogoutButton } = useUser();

  return (
    <div
      className={`relative z-[1500] flex h-fit max-w-full flex-[0] gap-1 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-800 p-2 text-white shadow-md ${className}`}
    >
      {/* <Logo /> */}
      <img src={Logo} title={title} />
      <div className="fixed top-0 right-2">
        {user ? (
          <UserCard>
            <LogoutButton />
          </UserCard>
        ) : (
          <LoginButton />
        )}
      </div>
      {children}
    </div>
  );
}
