import { animated } from "@react-spring/web";
import { createElement, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import type { useCountryReview } from "src/controllers/useCountryReview";
import { ActionButton } from "src/components/ActionButton";
import { useFloatingPanelSlideInAnimation } from "src/components/UserGuessFloatingPanel";
import { useCountryStore } from "src/hooks/useCountryStore";

const flagSize = 48;

const purgedElementsRegex = /<\/?(p|span|ol|li)(\s\w+="[a-z- ]+?")?>/g;
const elementsRegex = /(.*?)<(i|b|sup)>(.+?)<\/\2>(.*?)/g;
const mergedElementsRegex = /\s+(—)\s+/g;

function purge(text: string) {
  return text
    .replace(purgedElementsRegex, " ")
    .replace(mergedElementsRegex, "$1");
}

function replace(text: string) {
  const matches = [...text.matchAll(elementsRegex)];

  return matches.map(([, before, tag, content, after], i) => {
    const last =
      i === matches.length - 1 &&
      text.slice((matches[i].index || 0) + matches[i][0].length);

    return (
      <span key={i}>
        {before && <span>{before}</span>}
        {createElement(tag, { key: content }, content)}
        {after && <span>{after}</span>}
        {last && <span>{last}</span>}
      </span>
    );
  });
}

function parse(text?: string) {
  if (!text) return null;
  return replace(purge(text));
}

export function CountryWikiInfo() {
  const { storedCountry } = useCountryStore();
  const { isLoading, error, data } = useQuery({
    queryKey: [
      "country-info",
      storedCountry.data,
      storedCountry.data?.wikipedia,
      storedCountry.data?.name,
    ],
    queryFn: () =>
      axios.get<WikipediaSummaryResponse>(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${
          storedCountry.data?.wikipedia ?? storedCountry.data?.name
        }`,
        {
          headers: {
            "Api-User-Agent": "johnbernalfsd@gmail.com",
          },
        }
      ),
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return <div className={"rounded-md bg-sky-900/60 p-3"}>Loading...</div>;

  if (error)
    return (
      <p
        className={
          "scrollbar-track-sky-900 scrollbar-thumb-sky-700 scrollbar-thin pointer-events-auto max-h-[300px] max-w-xl overflow-y-auto break-all rounded-md bg-sky-900/60 p-3 hover:bg-sky-900"
        }
      >
        Data unavailable at the moment. An error has occurred.
      </p>
    );

  return (
    <section className="flex max-h-[300px] max-w-xl flex-col gap-2 p-3">
      <h3 className="flex items-center text-xl">
        <img
          className="peer mr-2"
          src={data?.data.thumbnail?.source.replace(
            /\/\d+px-/,
            `/${flagSize}px-`
          )}
          alt={storedCountry.data?.name}
          width={flagSize}
        />
        <span className="pointer-events-none absolute top-0 z-50 hidden -translate-y-1/3 rounded-sm bg-slate-200 p-2 shadow-lg peer-hover:block">
          <img
            className="shadow-md"
            loading="lazy"
            src={data?.data.thumbnail?.source}
            width={data?.data.thumbnail?.width}
            height={data?.data.thumbnail?.height}
          />
        </span>
        <div className="flex flex-col">
          <span>{data?.data.title}</span>
          <span className="text-xs">{data?.data.description}</span>
        </div>
      </h3>
      <p className="scrollbar-track-sky-900 scrollbar-thumb-sky-700 prose scrollbar-thin visible scroll-pb-3 overflow-y-auto indent-4 text-white">
        {parse(data?.data?.extract_html)}
      </p>
      <span className="flex justify-end">
        <a
          href={data?.data.content_urls.desktop.page}
          target="_blank"
          rel="noreferrer"
          className="mr-2 flex items-center justify-end gap-1 text-blue-300 hover:underline"
        >
          Read more on
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/16px-Wikipedia-logo-v2.svg.png"
            loading="lazy"
            width={16}
          />
          Wikipedia &gt;
        </a>
      </span>
    </section>
  );
}

export default function UserReviewFloatingPanel({
  shouldShow,
  activity: { showNextCountry },
}: {
  shouldShow: boolean;
  activity: Pick<ReturnType<typeof useCountryReview>, "showNextCountry">;
}) {
  const [showDetails, setShowDetails] = useState(true);
  const { firstTrail } = useFloatingPanelSlideInAnimation(shouldShow);

  return (
    <animated.div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-[1000] mx-auto flex h-fit w-fit flex-col items-center gap-2 rounded-md"
      style={firstTrail}
    >
      <details
        className="pointer-events-auto rounded-md bg-sky-900/70 p-3 shadow-md backdrop-blur-md hover:bg-sky-900"
        open={showDetails}
        onToggle={(event) => setShowDetails(event.currentTarget.open)}
      >
        <summary className="cursor-pointer">Wikipedia summary</summary>
        {shouldShow && showDetails && <CountryWikiInfo />}
      </details>
      <div className="pointer-events-auto flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <div className="rounded-md bg-red-500">
          <animated.div className="flex w-full justify-center overflow-hidden rounded-md">
            <ActionButton disabled={!shouldShow} onClick={showNextCountry}>
              Next country
            </ActionButton>
          </animated.div>
        </div>
      </div>
    </animated.div>
  );
}
