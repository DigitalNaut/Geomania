import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosRequestConfig } from "axios";
import { useEffect, useMemo } from "react";

import { RenderDOM } from "src/components/common/RenderDOM";
import { useCountryStore } from "src/hooks/useCountryStore";
import { type WikidataSummaryResponse } from "src/types/wikipedia";

const wikiApiURL = "https://en.wikipedia.org/w/api.php";

const config: AxiosRequestConfig = {
  headers: {
    "Api-User-Agent": import.meta.env.VITE_WIKIPEDIA_API_USER_AGENT,
  },
};

export function CountryWikiInfo({ onError }: { onError: (error: Error) => void }) {
  const { storedCountry } = useCountryStore();
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
        titles: storedCountry.data?.GEOUNIT ?? "",
      }),
    [storedCountry.data?.GEOUNIT],
  );

  const {
    isLoading: isSummaryLoading,
    error: summaryError,
    data: summaryData,
  } = useQuery({
    queryKey: ["country-info", storedCountry.data, storedCountry.data?.WIKIDATAID, storedCountry.data?.GEOUNIT, query],
    queryFn: () => axios.get<WikidataSummaryResponse>(`${wikiApiURL}?${query}`, config).then(({ data }) => data),
    refetchOnWindowFocus: false,
    enabled: !!storedCountry.data?.WIKIDATAID,
  });

  useEffect(() => {
    if (summaryError) onError(summaryError as Error);
  }, [summaryError, onError]);

  if (summaryError)
    return (
      <span className="pointer-events-auto max-h-[300px] max-w-xl overflow-y-auto break-all rounded-md bg-sky-900/60 p-3 scrollbar-thin scrollbar-track-sky-900 scrollbar-thumb-sky-700 hover:bg-sky-900">
        Data unavailable at the moment. An error has occurred.
      </span>
    );

  if (isSummaryLoading) return <div className="rounded-md bg-sky-900/60 p-3">Loading wiki...</div>;

  const page = summaryData?.query?.pages && Object.values(summaryData.query.pages)[0];

  if (!page) return <p>Page not found</p>;
  if ("missing" in page)
    return (
      <p className="m-2 rounded-sm border border-slate-400/40 px-4 py-2 italic">
        Page unavailable for {JSON.stringify(storedCountry.data?.GEOUNIT, null, 2)}.
      </p>
    );

  return (
    <section className="flex max-h-[60vh] max-w-md flex-col pb-6">
      <div className="visible relative scroll-p-8 overflow-y-auto break-words px-4 pb-4 text-justify indent-4 text-white scrollbar-thin scrollbar-track-sky-900 scrollbar-thumb-sky-700">
        <h1 className="mb-6 mt-4 flex justify-between gap-2 text-left text-3xl font-bold text-white">
          <span className="indent-0">{page.title}</span>
          <div>
            {page.thumbnail && (
              <img
                className="peer m-2"
                alt={storedCountry.data?.GEOUNIT}
                src={page.thumbnail.source}
                width={page.thumbnail.width}
              />
            )}

            <span className="pointer-events-none absolute inset-x-0 top-0 z-50 hidden rounded-sm bg-slate-200 p-2 shadow-lg peer-hover:block">
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
      <span className="flex justify-end border-t-2 border-sky-800 pb-4 pt-2 text-blue-300">
        <a
          className="mr-2 flex items-center justify-end gap-1 hover:underline"
          href={`https://en.wikipedia.org/wiki/${storedCountry.data?.GEOUNIT}`}
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
