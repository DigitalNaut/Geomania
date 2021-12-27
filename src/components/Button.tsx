import React from 'react';

interface Props {
  children: string;
  fit?: true;
  disabled?: boolean;
}

const Button: React.FC<
  Props & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = ({ children, fit, disabled, onClick }) => {
  const className =
    'p-4 text-xl font-bold text-center text-white bg-green-700 rounded-md shadow-md cursor-pointer select-none hover:bg-green-600 hover:shadow-lg';

  return (
    <div className="relative bg-clip-content">
      {disabled && (
        <div
          className={`absolute w-full h-full bg-green-900 ${disabled ? 'opacity-70' : 'opacity-0'}`}
        />
      )}
      <button
        disabled={disabled}
        type="button"
        className={[className, fit ? 'w-min' : 'w-full'].join()}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

Button.defaultProps = {
  fit: undefined,
  disabled: undefined,
};

export default Button;
