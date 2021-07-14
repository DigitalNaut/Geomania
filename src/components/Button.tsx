import React from "react";

const Button: React.VFC<Props> = ({ text, styles }) => {
  return (
    <div
      className={`w-1/3 p-4 m-9 text-xl font-medium text-center text-white bg-blue-700 rounded-md shadow-md hover:bg-blue-600 hover:shadow-lg cursor-pointer select-none`}
      style={styles}
    >
      {text}
    </div>
  );
};

interface Props {
  text: String;
  styles?: React.CSSProperties;
}

export default Button;
