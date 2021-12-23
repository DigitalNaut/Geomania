import React from 'react';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';

export default function HomeView(): JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map />
      <div className="flex justify-center w-full p-6">
        <Button>Begin</Button>
      </div>
    </div>
  );
}
