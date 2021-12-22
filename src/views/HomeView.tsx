import React from 'react';

import Title from 'src/views/components/Title';
import Map from 'src/views/components/MapDisplay';
import Button from 'src/views/components/Button';
// import MapController from 'src/controllers/components/MapController';

export default function HomeView(): JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map
      // zoom={1.75}
      // center={[25, 0]}
      // dragging={false}
      // zoomControl={false}
      // doubleClickZoom={false}
      // scrollWheelZoom={false}
      // touchZoom={false}
      // className="flex flex-col flex-grow w-full bg-gray-400"
      // style={{
      //   height: '100%',
      //   position: 'relative',
      // }}
      />
      <Button text="Begin" />
    </div>
  );
}
