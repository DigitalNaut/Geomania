import React from 'react';

interface Props {
  message?: string;
}

interface Children {
  title: string;
  children: React.ReactNode;
  color: 'red' | 'blue' | 'yellow';
}

function Wrapper({ title, children, color }: Children): JSX.Element {
  return (
    <div
      className={`flex flex-col justify-center w-full h-full p-3 text-center text-white bg-${color}-800 text-sm`}
    >
      <p className="text-4xl">{title}</p>
      {children}
    </div>
  );
}

function Loading({ message }: Props): JSX.Element {
  return (
    <Wrapper color="blue" title="Loading...">
      {message && <p>{message}</p>}
    </Wrapper>
  );
}

Loading.defaultProps = {
  message: undefined,
};

function Error({ message }: Props): JSX.Element {
  return (
    <Wrapper color="red" title="Uh oh!">
      {message && <p>{message}</p>}
    </Wrapper>
  );
}

Error.defaultProps = {
  message: undefined,
};

export { Loading, Error };
