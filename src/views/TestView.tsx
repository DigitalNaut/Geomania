import Title from "views/components/Title";
import MapDisplay from "views/components/MapDisplay";
import { Component } from "react";
import Button from "views/components/Button";

import { PathOptions } from "leaflet";
import fullConfig from "styles/TailwindStyles";

let mapStyle: PathOptions = {
  fillColor: fullConfig.theme.colors?.red[600],
  fillOpacity: 1,
  color: fullConfig.theme.colors?.gray[300],
  weight: 0.5,
  interactive: false,
};

export class TestView extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="flex flex-col w-full h-screen">
        <Title />
        <MapDisplay
          pathOptions={mapStyle}
          style={{
            height: "100%",
            position: "relative",
          }}
        />
        <Button
          text="Next"
          styles={{
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  }
}

export default TestView;
