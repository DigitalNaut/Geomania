import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { animated, useSpring, useTrail } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import type { useMapVisitor } from "src/hooks/useMapVisitor";
import { ActionButton } from "src/components/ActionButton";

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

function GuessInfoSection({
  giveHintHandler,
  userTries,
}: {
  giveHintHandler: () => void;
  userTries: number;
}) {
  return (
    <div className="flex w-full justify-between rounded-md p-2">
      <span className="whitespace-nowrap">Guesses: {userTries}</span>

      <button
        className="flex items-center gap-1 underline"
        type="button"
        onClick={giveHintHandler}
      >
        <FontAwesomeIcon icon={faQuestionCircle} />
        <span>Hint!</span>
      </button>
    </div>
  );
}

export default function UserGuessFloatingPanel({
  visitor: {
    handleSkipCountry,
    inputRef,
    isReady,
    submitAnswer,
    userGuessTally,
    giveHint,
  },
  incorrectAnswerAudioSrc,
  correctAnswerAudioSrc,
}: {
  visitor: ReturnType<typeof useMapVisitor>;
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

  const [firstTrail, secondTrail] = useTrail(2, {
    opacity: isReady ? 1 : 0,
    transform: isReady ? "translateY(0%)" : "translateY(100%)",
  });

  const [{ x }, errorShake] = useSpring(() => {
    return {
      from: { x: 0 },
      onStart: () => {
        if (!inputRef.current) return;
        inputRef.current.disabled = true;
        incorrectAnswerAudio.currentTime = 0;
        incorrectAnswerAudio.play();
      },
      onRest: () => {
        if (!inputRef.current) return;
        inputRef.current.disabled = false;
        inputRef.current.value = "";
        inputRef.current.focus();
        incorrectAnswerAudio.pause();
      },
    };
  });

  const shakeXStart = -5;
  const shakeXEnd = 5;

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

  const handleSubmit = () => {
    const isCorrectAnswer = submitAnswer();

    if (!isCorrectAnswer) {
      errorShake.start({
        from: { x: 0 },
        to: { x: 1 },
      });
    }

    if (isCorrectAnswer) {
      correctAnswerAudio.currentTime = 0;
      correctAnswerAudio.play();
    }
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
        <GuessHeaderSection skipCountryHandler={handleSkipCountry}>
          Which country is this?
        </GuessHeaderSection>
      </animated.div>

      <div className="flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <animated.div
          className="flex w-full justify-center overflow-hidden rounded-md"
          style={{ x: xShake }}
        >
          <input
            className="p-1 pl-4 text-xl text-black focus:ring focus:ring-inset"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            placeholder="Enter country name"
            disabled={!isReady}
            maxLength={50}
          />
          <ActionButton fit disabled={!isReady} onClick={handleSubmit}>
            Submit
          </ActionButton>
        </animated.div>

        <GuessInfoSection
          giveHintHandler={giveHint}
          userTries={userGuessTally}
        />
      </div>
    </animated.div>
  );
}
