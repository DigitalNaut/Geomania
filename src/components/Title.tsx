import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Title({ children }: Props): JSX.Element {
  return (
    <div
      className="max-w-full p-2 text-3xl text-white uppercase bg-green-800 shadow-lg drop-shadow-sm font-playtone"
      data-testid="app-title"
    >
      {children}
    </div>
  );
}
