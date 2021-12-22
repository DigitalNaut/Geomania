import React from 'react';
// import { PathOptions } from 'leaflet';
// import colors from 'tailwindcss/colors';

import Title from 'src/views/components/Title';
import Map from 'src/views/components/MapDisplay';
import Button from 'src/views/components/Button';

// const mapStyle: PathOptions = {
//   fillColor: colors.red[600],
//   fillOpacity: 1,
//   color: colors.gray[300],
//   weight: 0.5,
//   interactive: false,
// };

export default function TestView(): JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map
      //   pathOptions={mapStyle}
      //   style={{
      //     height: '100%',
      //     position: 'relative',
      //   }}
      //
      />
      <Button text="Next" />
    </div>
  );
}
