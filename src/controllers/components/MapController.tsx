import { useMapEvents } from 'react-leaflet';

export default function MapController() {
  useMapEvents({
    // click: (event) => {
    click: () => {
      console.log('Click');
    },
  });
  return null;
}
