import React from 'react';

interface Props {
  children: string;
}

export default function Button({ children }: Props): JSX.Element {
  return (
    <button
      type="button"
      className="w-1/3 p-4 text-xl font-medium text-center text-white bg-blue-700 rounded-md shadow-md cursor-pointer select-none hover:bg-blue-600 hover:shadow-lg"
    >
      {children}
    </button>
  );
}
