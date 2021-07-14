import React from "react";
import AppInfo from "utils/AppInfo";

interface Props {
  text?: string;
}

const DevelopmentModeTag: React.VFC<Props> = ({ text }) => {
  if (AppInfo.isInDevelopment())
    return (
      <div className="absolute bottom-0 left-0 italic font-light text-white bg-gray-600">
        Development Mode {text !== undefined ? `(${text})` : ""}
      </div>
    );
  else return <div />;
};

export default DevelopmentModeTag;
