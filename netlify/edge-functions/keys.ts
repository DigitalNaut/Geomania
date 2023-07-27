import { type Context } from "https://edge.netlify.com/";

export default (_: Request, { site }: Context) => {
  if (site.url === "http://geomaniac.netlify.app") return new Response("Not allowed", { status: 403 });

  const KEYS = {
    apiKey: Netlify.env.get("GOOGLE_API_KEY"),
    clientId: Netlify.env.get("GOOGLE_CLIENT_ID"),
    wikipediaApiUserAgent: Netlify.env.get("WIKIPEDIA_API_USER_AGENT"),
  };
  return new Response(JSON.stringify(KEYS));
};
