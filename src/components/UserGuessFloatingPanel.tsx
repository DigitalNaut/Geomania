import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { animated, useSpring, useTrail } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import type { useCountryGuesser } from "src/controllers/CountryGuesser";
import { ActionButton } from "src/components/ActionButton";

function useFloatingPanelAnimations(
  isReady: boolean,
  {
    onShakeStart,
    onShakeEnd,
    shakeAmount = 7,
    shakeDuration = 400,
  }: {
    onShakeStart: () => void;
    onShakeEnd: () => void;
    shakeAmount?: number;
    shakeDuration?: number;
  }
) {
  const [firstTrail, secondTrail] = useTrail(2, {
    opacity: isReady ? 1 : 0,
    transform: isReady ? "translateY(0%)" : "translateY(100%)",
  });

  const [{ x }, errorShakeApi] = useSpring(() => ({
    from: { x: 0 },
    onAnimationStart: onShakeStart,
    onAnimationEnd: onShakeEnd,
  }));

  const shakeXStart = -shakeAmount;
  const shakeXEnd = shakeAmount;

  const xShake = x.to(
    [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
    [
      0,
      shakeXEnd,
      shakeXStart,
      shakeXEnd,
      shakeXStart,
      shakeXEnd,
      shakeXStart,
      0,
    ]
  );

  const startShake = () =>
    errorShakeApi.start({
      from: { x: 0 },
      to: { x: 1 },
      config: { duration: shakeDuration },
    });

  return {
    firstTrail,
    secondTrail,
    startShake,
    xShake,
  };
}

function GuessHeaderSection({
  children,
  skipCountryHandler,
}: PropsWithChildren<{
  skipCountryHandler: () => void;
}>) {
  return (
    <div className="flex gap-2 rounded-md bg-slate-800">
      <p className="p-2">{children}</p>
      <button
        className="flex items-center gap-1 p-2 underline"
        role="button"
        title="Skip country"
        onClick={skipCountryHandler}
      >
        <span>Skip</span>
        <FontAwesomeIcon icon={faForward} />
      </button>
    </div>
  );
}

export default function UserGuessFloatingPanel({
  visitor: {
    answerInputRef,
    isReady,
    submitAnswer,
    userGuessTally,
    giveHint,
    skipCountry,
  },
  incorrectAnswerAudioSrc,
  correctAnswerAudioSrc,
}: {
  visitor: Pick<
    ReturnType<typeof useCountryGuesser>,
    | "answerInputRef"
    | "skipCountry"
    | "isReady"
    | "submitAnswer"
    | "userGuessTally"
    | "giveHint"
  >;
  incorrectAnswerAudioSrc: string;
  correctAnswerAudioSrc: string;
}) {
  const incorrectAnswerAudio = useMemo(
    () => new Audio(incorrectAnswerAudioSrc),
    [incorrectAnswerAudioSrc]
  );
  const correctAnswerAudio = useMemo(
    () => new Audio(correctAnswerAudioSrc),
    [correctAnswerAudioSrc]
  );

  function onShakeStart() {
    if (!answerInputRef.current) return;
    answerInputRef.current.disabled = true;
    incorrectAnswerAudio.currentTime = 0;
    incorrectAnswerAudio.play();
  }

  function onShakeEnd() {
    if (!answerInputRef.current) return;
    answerInputRef.current.disabled = false;
    answerInputRef.current.value = "";
    answerInputRef.current.focus();
    incorrectAnswerAudio.pause();
  }

  const { firstTrail, secondTrail, startShake, xShake } =
    useFloatingPanelAnimations(isReady, { onShakeStart, onShakeEnd });

  const handleSubmit = () => {
    const isCorrectAnswer = submitAnswer();

    if (isCorrectAnswer) {
      correctAnswerAudio.currentTime = 0;
      correctAnswerAudio.play();
    } else startShake();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <animated.div
      className="absolute inset-x-0 bottom-8 z-[1000] mx-auto flex h-fit w-fit flex-col items-center gap-2 rounded-md text-center"
      style={firstTrail}
    >
      <animated.div style={secondTrail}>
        <GuessHeaderSection skipCountryHandler={skipCountry}>
          Which country is this?
        </GuessHeaderSection>
      </animated.div>

      <div className="flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <div className="rounded-md bg-red-500">
          <animated.div
            className="flex w-full justify-center overflow-hidden rounded-md"
            style={{ x: xShake }}
          >
            <input
              className="p-1 pl-4 text-xl text-black focus:ring focus:ring-inset"
              ref={answerInputRef}
              onKeyDown={handleKeyDown}
              placeholder="Enter country name"
              disabled={!isReady}
              maxLength={50}
            />
            <ActionButton fit disabled={!isReady} onClick={handleSubmit}>
              Submit
            </ActionButton>
          </animated.div>
        </div>

        <div className="flex w-full justify-between rounded-md p-2">
          <span className="whitespace-nowrap">Guesses: {userGuessTally}</span>

          <button
            className="flex items-center gap-1 underline disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={giveHint}
          >
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span>Hint!</span>
          </button>
        </div>
      </div>
    </animated.div>
  );
}
