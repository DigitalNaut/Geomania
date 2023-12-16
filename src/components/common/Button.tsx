import type { DetailedHTMLProps, ButtonHTMLAttributes, PropsWithChildren } from "react";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

type ButtonProps = PropsWithChildren<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>>;

function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      role="button"
      className={twMerge(
        "flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-1 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type IconProps = {
  icon: IconDefinition;
};

Button.Icon = function Icon({ icon }: IconProps) {
  return <FontAwesomeIcon icon={icon} />;
};

export default Button;
