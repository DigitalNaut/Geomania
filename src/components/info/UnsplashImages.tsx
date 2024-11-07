import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosRequestConfig } from "axios";
import { useEffect, useMemo } from "react";
import Masonry from "react-responsive-masonry";

import { useCountryStore } from "src/hooks/useCountryStore";
import useEdgeKeys from "src/hooks/useEdgeKeys";
import type { UnsplashSearchResponse } from "src/types/unsplash";

const unsplashApiURL = "https://api.unsplash.com";
const unsplashSearch = `${unsplashApiURL}/search/photos?query=`;

export function UnsplashImages({ onError }: { onError: (error: Error) => void }) {
  const { data: keys } = useEdgeKeys();
  const { storedCountry } = useCountryStore();
  const query = useMemo(
    () =>
      new URLSearchParams({
        query: storedCountry.data?.GEOUNIT ?? "",
      }),
    [storedCountry.data],
  );

  const config: AxiosRequestConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Client-ID ${keys?.unsplash.accessKey}`,
      },
    }),
    [keys?.unsplash.accessKey],
  );

  const { isLoading, error, data } = useQuery({
    queryKey: ["country-images", storedCountry.data, storedCountry.data?.GEOUNIT, query, config],
    queryFn: () => axios.get<UnsplashSearchResponse>(`${unsplashSearch}${query}`, config).then(({ data }) => data),
    refetchOnWindowFocus: false,
    enabled: !!keys?.unsplash.accessKey && !!storedCountry.data?.GEOUNIT,
  });

  useEffect(() => {
    if (error) onError(error as Error);
  }, [error, onError]);

  if (error)
    return <p className="mr-3 rounded-md bg-sky-900 p-3">Images are unavailable at the moment.</p>;

  if (isLoading)
    return <div className="mr-3 rounded-md bg-sky-900 p-3">Loading images for {storedCountry.data?.GEOUNIT}...</div>;

  return (
    <section className="pt-2">
      <div className="max-h-[60vh] w-[20vw] overflow-y-auto scrollbar-thin scrollbar-track-sky-900 scrollbar-thumb-sky-700">
        {data?.results.length && (
          <Masonry columnsCount={2} gutter="0.5rem">
            {data.results.map((image) => (
              <div className="group relative h-auto w-full overflow-hidden rounded-md" key={image.id}>
                <img src={image.urls.thumb} alt={image.alt_description} loading="lazy" />
                <span className="absolute right-0 top-0 hidden rounded-bl-md bg-sky-900/70 p-2 text-right text-sm shadow-sm group-hover:block">
                  <a
                    className="underline"
                    href={image.links.html}
                    target="_blank"
                    rel="noreferrer"
                    title="View on Unsplash"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </a>
                </span>
                <span className="absolute inset-x-0 bottom-0 hidden bg-sky-900/70 p-2 text-right text-xs group-hover:block">
                  Photo by{" "}
                  <a
                    className="underline"
                    href={`https://unsplash.com/@${image.user.username}?utm_source=Geomaniac&utm_medium=referral`}
                    target="_blank"
                    rel="noreferrer"
                    title="Visit Unsplash profile"
                  >
                    {image.user.name}
                  </a>
                </span>
              </div>
            ))}
          </Masonry>
        )}
      </div>

      <span className="flex justify-end border-t-2 border-sky-800 pt-2 text-blue-300">
        Courtesy of&nbsp;
        <a
          className="mr-2 flex items-center justify-end gap-1 hover:underline"
          href="https://unsplash.com/?utm_source=Geomaniac&utm_medium=referral"
          target="_blank"
          rel="noreferrer"
        >
          Unsplash
        </a>
      </span>
    </section>
  );
}
