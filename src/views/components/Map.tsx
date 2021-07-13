import React, { Component } from "react";
import * as mapData from "data/countries.json";

import { getCountryNames } from "model/DataParser";

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
      countries: getCountryNames(mapData.features),
    });
  }

  render() {
    return (
      <div>
        Total countries: {this.state.countries.length}
        <ol>
          {this.state.countries.map((country, index) => (
            <li key={index}>
              {index + 1}. {country}
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

export default Map;
