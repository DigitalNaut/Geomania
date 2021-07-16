import React from "react";
import AppInfo from "utils/AppInfo";

interface Props {
  text?: string;
  callback?: () => void;
}

const DevelopmentModeTag: React.VFC<Props> = ({ text, callback }) => {
  if (AppInfo.isDev())
    return (
      <div
        onClick={callback}
        className="absolute bottom-0 left-0 italic font-light text-white bg-gray-800 cursor-pointer select-none hover:bg-gray-700"
      >
        Development Mode {text !== undefined ? `(${text})` : ""}
      </div>
    );
  else return <></>;
};

export default DevelopmentModeTag;
