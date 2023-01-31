import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

export function Checkmark({
  condition,
  property,
  trueIcon = faCheck,
  falseIcon = faTimes,
  trueColor = "text-green-500",
  falseColor = "text-red-500",
}: {
  condition: boolean;
  property: string;
  trueIcon?: IconDefinition;
  falseIcon?: IconDefinition;
  trueColor?: string;
  falseColor?: string;
}) {
  return (
    <FontAwesomeIcon
      className={condition ? trueColor : falseColor}
      icon={condition ? trueIcon : falseIcon}
      title={"Has " + property}
    />
  );
}
