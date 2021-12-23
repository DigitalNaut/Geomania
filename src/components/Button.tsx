import React from 'react';

interface Props {
  children: string;
}

export default function Button({ children }: Props): JSX.Element {
  return (
    <button
      type="button"
      className="w-full p-4 text-xl font-bold text-center text-white bg-green-700 rounded-md shadow-md cursor-pointer select-none hover:bg-green-600 hover:shadow-lg"
    >
      {children}
    </button>
  );
}
