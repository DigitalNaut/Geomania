import Title from "components/Title";
import Map from "components/Map";
import { Component } from "react";
import Button from "components/Button";

export class TestView extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="flex flex-col w-full h-screen">
        <Title />
        <Map
          styles={{
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
