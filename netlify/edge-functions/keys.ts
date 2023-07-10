import type { Context } from "https://edge.netlify.com/";

export default (_: Request, { site }: Context) => {
  const KEYS = {
    apiKey: Netlify.env.get("GOOGLE_API_KEY"),
    clientId: Netlify.env.get("GOOGLE_CLIENT_ID"),
  };

  if (site.url === "http://geomaniac.netlify.app")
    return new Response(JSON.stringify(KEYS));
  else return new Response("Not allowed", { status: 403 });
};
