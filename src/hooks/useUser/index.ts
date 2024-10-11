import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

type UserContext = {
  user?: GoogleUserCredential | null;
  LoginButton(): JSX.Element | null;
  LogoutButton(): JSX.Element | null;
  UserCard(props: PropsWithChildren): JSX.Element | null;
  logout(reason?: string): void;
};

const userContext = createContext<UserContext | null>(null);

export const Provider = userContext.Provider;

export function useUser() {
  const context = useContext(userContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
