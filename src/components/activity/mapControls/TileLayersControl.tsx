import { LayersControl, TileLayer } from "react-leaflet";

const tileLayerProviders = [
  {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    name: "None",
    url: "",
    attribution: "",
  },
];

export function TileLayersControl() {
  return (
    <LayersControl position="topright">
      {tileLayerProviders.map((provider) => (
        <LayersControl.BaseLayer
          key={provider.name}
          name={provider.name}
          checked={provider.name === "None"}
        >
          <TileLayer url={provider.url} attribution={provider.attribution} />
        </LayersControl.BaseLayer>
      ))}
    </LayersControl>
  );
}
