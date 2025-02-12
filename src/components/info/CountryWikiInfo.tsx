import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosRequestConfig } from "axios";
import { useEffect, useMemo } from "react";

import { RenderDOM } from "src/components/common/RenderDOM";
import { useAppSelector } from "src/store/hooks";
import { type WikidataSummaryResponse } from "src/types/wikipedia";

const wikiApiURL = "https://en.wikipedia.org/w/api.php";

/**
 * Axios request config that includes the Wikipedia user agent in the headers
 */
const config: AxiosRequestConfig = {
  headers: {
    "Api-User-Agent": import.meta.env.VITE_WIKIPEDIA_API_USER_AGENT,
  },
};

export function CountryWikiInfo({ onError }: { onError: (error: Error) => void }) {
  const {
    review: { currentCountry },
  } = useAppSelector((state) => state.countryStore);
  const storedCountry = currentCountry ? currentCountry : null;

  const query = useMemo(
    () =>
      new URLSearchParams({
        format: "json",
        action: "query",
        prop: "info|pageimages|extracts",
        exintro: "",
        inprop: "url|thumbnail|original",
        piprop: "thumbnail|original",
        redirects: "1",
        origin: "*",
        titles: storedCountry?.GEOUNIT ?? "",
      }),
    [storedCountry?.GEOUNIT],
  );

  const {
    isLoading: isSummaryLoading,
    error: summaryError,
    data: summaryData,
  } = useQuery({
    queryKey: ["country-info", storedCountry, storedCountry?.WIKIDATAID, storedCountry?.GEOUNIT, query],
    queryFn: () => axios.get<WikidataSummaryResponse>(`${wikiApiURL}?${query}`, config).then(({ data }) => data),
    refetchOnWindowFocus: false,
    enabled: !!storedCountry?.WIKIDATAID,
  });

  useEffect(() => {
    if (summaryError) onError(summaryError as Error);
  }, [summaryError, onError]);

  if (summaryError)
    return (
      <span className="scrollbar-thin scrollbar-track-sky-900 scrollbar-thumb-sky-700 pointer-events-auto max-h-[300px] max-w-xl overflow-y-auto rounded-md bg-sky-900/60 p-3 break-all hover:bg-sky-900">
        Data unavailable at the moment. An error has occurred.
      </span>
    );

  if (isSummaryLoading) return <div className="rounded-md bg-sky-900/60 p-3">Loading wiki...</div>;

  const page = summaryData?.query?.pages && Object.values(summaryData.query.pages)[0];

  if (!page) return <p>Page not found</p>;
  if ("missing" in page)
    return (
      <p className="m-2 rounded-xs border border-slate-400/40 px-4 py-2 italic">
        Page unavailable for {JSON.stringify(storedCountry?.GEOUNIT, null, 2)}.
      </p>
    );

  return (
    <section className="flex max-h-[60vh] max-w-md flex-col">
      <div className="scrollbar-thin scrollbar-track-sky-900 scrollbar-thumb-sky-700 visible relative scroll-p-8 overflow-y-auto px-4 pb-4 text-justify indent-4 break-words text-white">
        <h1 className="mt-4 mb-6 flex justify-between gap-2 text-left text-3xl font-bold text-white">
          <span className="indent-0">{page.title}</span>
          <div>
            {page.thumbnail && (
              <img
                className="peer m-2"
                alt={storedCountry?.GEOUNIT}
                src={page.thumbnail.source}
                width={page.thumbnail.width}
              />
            )}

            <span className="pointer-events-none absolute inset-x-0 top-0 z-50 hidden rounded-xs bg-slate-200 p-2 shadow-lg peer-hover:block">
              {page.original && (
                <img
                  className="shadow-md"
                  loading="lazy"
                  src={page.original.source}
                  width={page.original.width}
                  height={page.original.height}
                />
              )}
            </span>
          </div>
        </h1>

        <RenderDOM className="prose" input={page.extract} />
      </div>
      <span className="flex justify-end border-t-2 border-sky-800 pt-2 text-blue-300">
        <a
          className="flex items-baseline justify-end gap-1 p-2 hover:underline"
          href={`https://en.wikipedia.org/wiki/${storedCountry?.GEOUNIT}`}
          target="_blank"
          rel="noreferrer"
        >
          Read on Wikipedia&nbsp;
          <FontAwesomeIcon icon={faExternalLink} />
        </a>
      </span>
    </section>
  );
}
