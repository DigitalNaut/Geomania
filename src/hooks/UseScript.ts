import { useEffect } from "react";

type ScriptProps = {
  src: string;
  onLoad: (this: GlobalEventHandlers, ev: Event) => void;
};

export function Script({ src, onLoad }: ScriptProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = onLoad;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onLoad, src]);

  return null;
}
