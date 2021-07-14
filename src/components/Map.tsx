import { Component } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { GeoJSON as GeoJSONType } from "types/map";
import AboutApp from "utils/AppInfo";
import { loadData } from "model/DataParser";
import DevelopmentModeTag from "components/DevelopmentModeTag";
import Loading from "components/Loading";
import Error from "components/Error";

interface Props {
  styles?: React.CSSProperties;
}
interface State {
  countries: GeoJSONType | null;
  loading: Boolean;
  error: Boolean;
}

class Map extends Component<Props, State> {
  constructor(props: Object) {
    super(props);
    this.state = {
      countries: null,
      loading: true,
      error: false,
    };
  }

  async componentDidMount() {
    const geoData = await loadData(AboutApp.isInDevelopment())
      .then((data) => data)
      .catch((reason) => {
        this.setState({ error: true });
        return null;
      });

    this.setState({
      countries: geoData,
      loading: false,
    });
  }

  render() {
    if (this.state.loading) return <Loading />;
    if (this.state.error) return <Error />;

    return (
      <div
        className="flex flex-col flex-grow w-full bg-gray-400"
        data-testid="interactive-map"
      >
        <MapContainer
          style={this.props.styles}
          zoom={2}
          center={[25, 0]}
        >
          <DevelopmentModeTag
            text={this.state.countries?.features.length.toString()}
          />
          <GeoJSON data={this.state.countries?.features}></GeoJSON>
        </MapContainer>
      </div>
    );
  }
}

export default Map;
