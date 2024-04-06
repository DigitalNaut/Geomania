import { type KeyboardEvent, type PropsWithChildren, type RefObject, useCallback, useMemo } from "react";
import { animated, useSpring, useTrail } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForwardStep, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import { ActionButton } from "src/components/common/ActionButton";
import { type NullableCountryData, useCountryStore } from "src/hooks/useCountryStore";
import { type QuizKind } from "src/contexts/MapActivityContext";

import unknownFlag from "src/assets/images/unknown-flag.min.svg?url";
import { InlineButton } from "./InlineButton";

function useHorizontalShakeAnimation({
  onShakeStart,
  onShakeEnd,
  shakeAmount = 7,
  shakeDuration = 400,
}: {
  onShakeStart: () => void;
  onShakeEnd: () => void;
  shakeAmount?: number;
  shakeDuration?: number;
}) {
  const [{ x }, errorShakeApi] = useSpring(() => ({
    from: { x: 0 },
  }));

  const shakeXStart = -shakeAmount;
  const shakeXEnd = shakeAmount;

  const xShake = x.to(
    [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
    [0, shakeXEnd, shakeXStart, shakeXEnd, shakeXStart, shakeXEnd, shakeXStart, 0],
  );

  const startShake = () =>
    errorShakeApi.start({
      from: { x: 0 },
      to: { x: 1 },
      config: { duration: shakeDuration },
      onStart: onShakeStart,
      onRest: onShakeEnd,
    });

  return {
    startShake,
    xShake,
  };
}

export function useFloatingPanelSlideInAnimation(shouldShow: boolean) {
  const [firstTrail, secondTrail] = useTrail(2, {
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? "translateY(0%)" : "translateY(100%)",
  });

  return {
    firstTrail,
    secondTrail,
  };
}

function QuizHeaderSection({
  children,
  skipCountryHandler,
}: PropsWithChildren<{
  skipCountryHandler: () => void;
}>) {
  return (
    <div className="flex gap-2 rounded-md bg-slate-800">
      <div className="p-2">{children}</div>
      <button
        className="flex items-center gap-1 p-2 underline"
        role="button"
        title="Skip country"
        onClick={skipCountryHandler}
      >
        <span>Skip</span>
        <FontAwesomeIcon icon={faForwardStep} />
      </button>
    </div>
  );
}

function QuizPointerSection({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center gap-4 rounded-md bg-white/50 px-8 py-6 text-xl text-slate-800 shadow-xl backdrop-blur-xl">
      {children}
    </div>
  );
}

function CountryFlag({ a2 }: { a2?: string }) {
  return (
    <img
      className="h-[2.4rem] w-16 p-1 shadow-md before:block before:h-[2.4rem] before:w-16 before:bg-custom-unknown-flag"
      src={!a2 || a2 === "-99" ? unknownFlag : `https://flagcdn.com/${a2.toLocaleLowerCase()}.svg`}
      loading="lazy"
      width={64}
      height={38.4}
      onError={() => {
        console.log(`Failed to load flag for ${a2}`);
      }}
    />
  );
}

export default function QuizFloatingPanel({
  shouldShow,
  mode,
  userGuessTally,
  inputRef,
  submitAnswer,
  skipCountry,
  giveHint,
}: {
  shouldShow: boolean;
  mode?: QuizKind;
  userGuessTally: number;
  inputRef: RefObject<HTMLInputElement>;
  submitAnswer?: (text: string) => NullableCountryData;
  skipCountry: () => void;
  giveHint: () => void;
}) {
  const { storedCountry } = useCountryStore();

  const onShakeStart = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.disabled = true;
  }, [inputRef]);

  const onShakeEnd = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.disabled = false;
    inputRef.current.focus();
    inputRef.current.select();
  }, [inputRef]);

  const { startShake, xShake } = useHorizontalShakeAnimation({
    onShakeStart,
    onShakeEnd,
  });

  const { firstTrail, secondTrail } = useFloatingPanelSlideInAnimation(shouldShow);

  const handleSubmit = () => {
    const isCorrectAnswer = submitAnswer?.(inputRef.current?.value ?? "");

    if (!isCorrectAnswer) startShake();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const a2 = useMemo(() => storedCountry.data?.ISO_A2_EH, [storedCountry.data?.ISO_A2_EH]);

  return (
    <animated.div
      className="absolute inset-x-0 bottom-8 z-[1000] mx-auto flex size-fit flex-col items-center gap-2 text-center"
      style={firstTrail}
    >
      <animated.div style={secondTrail}>
        {mode === "typing" && (
          <QuizHeaderSection skipCountryHandler={skipCountry}>Which country is this?</QuizHeaderSection>
        )}
        {mode === "pointing" && (
          <QuizPointerSection>
            <span>
              Click on <strong>{storedCountry.data?.GEOUNIT}</strong>
            </span>
            <CountryFlag a2={a2} />
          </QuizPointerSection>
        )}
      </animated.div>

      <div className="flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 p-2 drop-shadow-lg">
        {mode === "typing" && (
          <div className="rounded-md bg-red-500">
            <animated.div className="flex w-full justify-center overflow-hidden rounded-md" style={{ x: xShake }}>
              <input
                className="p-1 pl-4 text-xl text-black focus:ring focus:ring-inset"
                ref={inputRef}
                onKeyDown={handleKeyDown}
                placeholder="Enter country name"
                disabled={!shouldShow}
                maxLength={50}
              />
              <ActionButton disabled={!shouldShow} onClick={handleSubmit}>
                Submit
              </ActionButton>
            </animated.div>
          </div>
        )}

        <div className="flex w-full items-center justify-between gap-4 rounded-md px-1 drop-shadow">
          <span className="whitespace-nowrap px-6 py-4">Guesses: {userGuessTally}</span>

          {mode === "typing" && (
            <button
              className="flex items-center gap-1 p-4 underline disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={giveHint}
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span>Hint!</span>
            </button>
          )}

          {mode === "pointing" && (
            <InlineButton onClick={skipCountry}>
              <span className="no-underline">Skip</span>
              <FontAwesomeIcon icon={faForwardStep} />
            </InlineButton>
          )}
        </div>
      </div>
    </animated.div>
  );
}
