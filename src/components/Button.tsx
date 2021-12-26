import React from 'react';

interface Props {
  children: string;
  fit?: true;
}

const Button: React.FC<
  Props & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = ({ children, fit }) => {
  const className =
    'p-4 text-xl font-bold text-center text-white bg-green-700 rounded-md shadow-md cursor-pointer select-none hover:bg-green-600 hover:shadow-lg';

  return (
    <button type="button" className={[className, fit ? 'w-min' : 'w-full'].join()}>
      {children}
    </button>
  );
};

Button.defaultProps = {
  fit: undefined,
};

export default Button;
