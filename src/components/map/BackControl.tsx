import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";

import Button from "src/components/common/Button";

const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
};

export function BackControl({
  position,
  onClick,
  label = "Back",
}: {
  position?: keyof typeof POSITION_CLASSES;
  onClick: () => void;
  label?: string;
}) {
  const positionClass = (position && POSITION_CLASSES[position]) ?? POSITION_CLASSES.topright;
  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar rounded-full">
        <Button
          className="w-fit bg-white text-base text-slate-950 hover:bg-red-600 hover:text-white"
          title="End the activity"
          onClick={onClick}
        >
          <Button.Icon icon={faCaretLeft} />
          <span>{label}</span>
        </Button>
      </div>
    </div>
  );
}
