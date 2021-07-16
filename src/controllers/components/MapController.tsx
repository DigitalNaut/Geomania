import { useMapEvents } from "react-leaflet";

const MapController = () => {
  useMapEvents({
    click: (event) => {
      console.log("Click");
    },
  });
  return null;
};

export default MapController;