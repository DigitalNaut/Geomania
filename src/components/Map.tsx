import React, { Component } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { loadData } from "model/DataParser";
import { GeoJSON as GeoJSONType } from "types/map";
import * as AboutApp from "utils/AppInfo";

interface Props {}
interface State {
  countries: GeoJSONType | null;
}

class Map extends Component<Props, State> {
  constructor(props: Object) {
    super(props);
    this.state = { countries: null };
  }

  async componentDidMount() {
    const geoData = await loadData(AboutApp.isInDevelopment())
      .then((data) => data)
      .catch((reason) => null);

    this.setState({ countries: geoData });
  }

  render() {
    return (
      <div
        className="flex flex-col flex-grow w-full bg-gray-400"
        data-testid="interactive-map"
      >
        <MapContainer style={{ height: "60vh" }} zoom={2} center={[20, 100]}>
          <GeoJSON data={this.state.countries?.features}></GeoJSON>
        </MapContainer>
      </div>
    );
  }
}

export default Map;
