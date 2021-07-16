import { useState, useEffect } from "react";
import { MapContainer, GeoJSON, MapContainerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { GeoJSON as GeoJSONType } from "core/types/map";
import AboutApp from "utils/AppInfo";
import { loadData } from "models/DataParser";
import DevelopmentModeTag from "views/components/DevelopmentModeTag";
import { Loading, Error } from "views/components/StatusDisplay";
import { PathOptions } from "leaflet";
import fullConfig from "styles/TailwindStyles";

interface Props extends MapContainerProps {
  children?: React.ReactNode;
  pathOptions?: PathOptions;
}

let countryStyle: PathOptions = {
  fillColor: fullConfig.theme.colors?.blue[600],
  fillOpacity: 1,
  color: fullConfig.theme.colors?.gray[300],
  weight: 1,
  interactive: false,
};

const MapDisplay: React.VFC<Props> = ({
  children,
  pathOptions,
  ...props
}) => {
  const [countries, setCountries] = useState<GeoJSONType | null>(null);
  const [isDev, setIsDev] = useState(AboutApp.isDev());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const geoData = await loadData(isDev)
        .then((data) => data)
        .catch((_) => {
          setError(true);
          return null;
        });

      setCountries(geoData);
      setLoaded(true);
    }
    if (!loaded) fetchData();
  }, [loaded, isDev]);

  if (!loaded) return <Loading message="Reading data." />;
  if (error) return <Error message="Error loading data." />;

  if (countries)
    return (
      <MapContainer {...props}>
        {children}
        <GeoJSON
          //@ts-ignore
          data={countries.features}
          style={pathOptions || countryStyle}
        ></GeoJSON>
        <DevelopmentModeTag
          text={countries.features.length.toString()}
          callback={() => {
            setIsDev((state) => !state);
            setLoaded(false);
          }}
        />
      </MapContainer>
    );
  else return <Loading message="Parsing data." />;
};

export default MapDisplay;
