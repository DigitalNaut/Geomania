interface Image {
  source: string;
  width: number;
  height: number;
}

type PageNotFound = {
  ns: number;
  title: string;
  missing?: string;
};

type PageInfo = {
  pageid: number;
  ns: number;
  title: string;
  extract: string;
  thumbnail: Image;
  original: Image;
  fullurl: string;
};

type Pages = Record<number, PageInfo & PageNotFound>;

interface Query {
  pages: Pages;
}

declare interface WikidataSummaryResponse {
  batchcomplete: string;
  query: Query;
}
