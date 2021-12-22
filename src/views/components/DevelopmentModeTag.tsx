import React from 'react';

import AppInfo from 'src/utils/AppInfo';

interface Props {
  text?: string;
  callback?: () => void;
}

export default function DevelopmentModeTag({ text, callback }: Props): JSX.Element | null {
  if (AppInfo.isDev())
    return (
      <button
        type="button"
        onClick={callback}
        className="absolute bottom-0 left-0 italic font-light text-white bg-gray-800 cursor-pointer select-none hover:bg-gray-700"
      >
        Development Mode {text !== undefined ? `(${text})` : ''}
      </button>
    );
  return null;
}

DevelopmentModeTag.defaultProps = {
  text: '',
  callback: () => null,
};
