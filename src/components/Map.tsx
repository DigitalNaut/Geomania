import React, { Component } from "react";

interface Props {}
interface State {
  countries: string[] | [];
}

class Map extends Component<Props, State> {
  componentDidMount() {}

  render() {
    return <div className="flex flex-col flex-grow w-full bg-gray-400">Map component</div>;
  }
}

export default Map;
