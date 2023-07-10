interface Desktop {
  page: string;
  revisions: string;
  edit: string;
  talk: string;
}

interface ContentUrls {
  desktop: Desktop;
  mobile: Desktop;
}

interface Thumbnail {
  source: string;
  width: number;
  height: number;
}

interface Titles {
  canonical: string;
  normalized: string;
  display: string;
}

interface Namespace {
  id: number;
  text: string;
}

declare interface WikipediaSummaryResponse {
  type: string;
  title: string;
  displaytitle: string;
  namespace: Namespace;
  wikibase_item: string;
  titles: Titles;
  pageid: number;
  thumbnail: Thumbnail;
  originalimage: Thumbnail;
  lang: string;
  dir: string;
  revision: string;
  tid: string;
  timestamp: string;
  description: string;
  description_source: string;
  content_urls: ContentUrls;
  extract: string;
  extract_html: string;
}
