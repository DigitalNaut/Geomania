import React from 'react';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
// import MapController from 'src/controllers/components/MapController';

export default function HomeView(): JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map />
      <Button>Begin</Button>
    </div>
  );
}
