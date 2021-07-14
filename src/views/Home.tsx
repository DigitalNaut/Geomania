import Title from "components/Title";
import Map from "components/Map";
import { Component } from "react";

export class Home extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="flex flex-col w-full h-screen">
        <Title />
        <Map />
      </div>
    );
  }
}

export default Home;
