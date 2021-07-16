import Title from "views/components/Title";
import MapDisplay from "views/components/MapDisplay";
import { Component } from "react";
import Button from "views/components/Button";
import MapController from "controllers/components/MapController";

export class HomeView extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="flex flex-col w-full h-screen">
        <Title />
        <MapDisplay
          zoom={1.75}
          center={[25, 0]}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
          className="flex flex-col flex-grow w-full bg-gray-400"
          style={{
            height: "100%",
            position: "relative",
          }}
        >
          <MapController />
        </MapDisplay>
        <Button
          text="Begin"
          styles={{
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  }
}

export default HomeView;
