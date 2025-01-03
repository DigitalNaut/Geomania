export function pushSearchParamsToURL(searchParams: URLSearchParams) {
  const urlSearchParams = new URLSearchParams(window.location.search);

  for (const [key, value] of searchParams.entries()) {
    urlSearchParams.set(key, value);
  }

  window.history.pushState(null, "", `?${urlSearchParams.toString()}`);
}
