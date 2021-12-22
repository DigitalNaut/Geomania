import React from 'react';

interface Props {
  text: string;
}

export default function Button({ text }: Props): JSX.Element {
  return (
    <div className="w-1/3 p-4 text-xl font-medium text-center text-white bg-blue-700 rounded-md shadow-md cursor-pointer select-none m-9 hover:bg-blue-600 hover:shadow-lg">
      {text}
    </div>
  );
}
