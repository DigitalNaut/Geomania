import React from 'react';
import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
// import { PathOptions } from 'leaflet';
// import colors from 'tailwindcss/colors';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import countries from 'src/data/country-dots.json';

// import AboutApp from 'src/utils/AppInfo';
// import { loadData } from 'src/models/DataParser';
// import DevelopmentModeTag from 'src/views/components/DevelopmentModeTag';
// import { Loading, Error } from 'src/views/components/StatusDisplay';

// interface Props extends MapContainerProps {
//   children?: JSX.Element;
//   pathOptions?: PathOptions;
// }

// const countryStyle: PathOptions = {
//   fillColor: colors.blue[600],
//   fillOpacity: 1,
//   color: colors.gray[300],
//   weight: 1,
//   interactive: false,
// };

/// / eslint-disable-line react/jsx-props-no-spreading
// export default function MapDisplay({ children, pathOptions, ...props }: Props): JSX.Element {
//   const [countries, setCountries] = useState<GeoJsonObject | null>(null);
//   const [isDev, setIsDev] = useState(AboutApp.isDev());
//   const [loaded, setLoaded] = useState(false);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     async function fetchData() {
//       const geoData = await loadData(isDev)
//         .then((data) => data)
//         .catch(() => {
//           setError(true);
//           return null;
//         });

//       setCountries(geoData);
//       setLoaded(true);
//     }
//     if (!loaded) fetchData();
//   }, [loaded, isDev]);

//   if (!loaded) return <Loading message="Reading data." />;
//   if (error) return <Error message="Error loading data." />;

//   if (countries)
//     return (
//       <MapContainer {...props}>
//         {children}
//         <GeoJSON
//           data={countries.features}
//           style={pathOptions || countryStyle}
//         />
//         <DevelopmentModeTag
//           text={countries.features.length.toString()}
//           callback={() => {
//             setIsDev((state) => !state);
//             setLoaded(false);
//           }}
//         />
//       </MapContainer>
//     );
//   return <Loading message="Parsing data." />;
// }

// * https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
});

const center = { lat: 59.433421, lng: 24.75224 };

export default function Map() {
  const onEachFeature = (feature: Feature<Geometry, { popupContent: string }>, layer: L.Layer) => {
    if (feature.properties) {
      const { popupContent } = feature.properties;
      layer.bindPopup(popupContent);
    }
  };
  return (
    <MapContainer style={{ height: '100vh', width: '100vw' }} center={center} zoom={2}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={[59.43046, 24.728563]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker> */}
      <GeoJSON data={countries as GeoJsonObject} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}

// MapDisplay.defaultProps = {
//   children: undefined,
//   pathOptions: undefined,
// };
