import type { DetailedHTMLProps, ButtonHTMLAttributes, PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = PropsWithChildren<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon?: IconDefinition;
  }
>;

export function Button({ children, className, icon, ...props }: ButtonProps) {
  return (
    <button
      role="button"
      className={`flex items-center gap-2 rounded-full bg-blue-500 px-4 py-1 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent
        ${className}`}
      {...props}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </button>
  );
}
