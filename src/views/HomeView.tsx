import React from 'react';

import Title from 'src/views/components/Title';
import Map from 'src/views/components/Map';
import Button from 'src/views/components/Button';
// import MapController from 'src/controllers/components/MapController';

export default function HomeView(): JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map />
      <Button text="Begin" />
    </div>
  );
}
