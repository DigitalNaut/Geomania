import React from 'react';

import Title from 'src/views/components/Title';
import Map from 'src/views/components/Map';
import Button from 'src/views/components/Button';

export default function TestView(): JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map />
      <Button text="Next" />
    </div>
  );
}
