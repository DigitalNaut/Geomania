import React from 'react';

export default function Title(): JSX.Element {
  return (
    <div
      className="max-w-full p-2 text-3xl text-white uppercase bg-green-800 shadow-lg drop-shadow-sm font-playtone"
      data-testid="app-title"
    >
      Geomania
    </div>
  );
}
