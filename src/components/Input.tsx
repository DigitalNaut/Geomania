import React, { useState } from 'react';
import Leaflet from 'leaflet';
import { Marker } from 'react-leaflet';

import { fixName } from 'src/utility';

type CustomMarkerProps = {
  position: Leaflet.LatLngTuple;
  text: string;
};

const Input: React.FC<CustomMarkerProps> = ({ position, text }) => {
  const [input, setInput] = useState('');

  let className =
    'p-2 text-white bg-gray-900 rounded-sm basis-full drop-shadow outline outline-1 outline-gray-800';
  const html = document.createElement('input');
  html.innerText = fixName(text);
  html.className = className;
  html.value = input;
  html.onchange = () => setInput(html.value);
  html.placeholder = 'Which country is this?';

  className = 'flex justify-center text-center outline-none place-items-center';
  const icon = Leaflet.divIcon({
    html,
    iconSize: [0, 0],
    className,
  });

  return <Marker position={position} icon={icon} />;
};

export default Input;
