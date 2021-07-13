import React, { Component } from "react";
import mapData from "data/countries.json";

import { Feature } from "types/map";

interface Props {}
interface State {
  countries: string[] | [];
}

class Map extends Component<Props, State> {
  constructor(props: Object) {
    super(props);
    this.state = { countries: [] };
  }

  componentDidMount() {
    this.setState({
      countries: mapData.features.map(
        (country: Feature) => country.properties.ADMIN
      ),
    });
  }

  render() {
    return (
      <div>
        Total countries: {this.state.countries.length}
        <ol>
          {this.state.countries.map((country, index) => (
            <li key={index}>
              {index+1}. {country}
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

export default Map;
