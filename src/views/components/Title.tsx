import React from 'react';

export default function Title(): JSX.Element {
  return (
    <div
      className="max-w-full p-6 text-4xl text-center text-white bg-blue-600"
      data-testid="app-title"
    >
      Geomania
    </div>
  );
}
