import type { Context } from "https://edge.netlify.com/";

export default (_: Request, { site }: Context) => {
  const KEYS = [
    Netlify.env.get("GOOGLE_API_KEY"),
    Netlify.env.get("GOOGLE_CLIENT_ID"),
  ];

  if (site.url === "http://geomaniac.netlify.app")
    return new Response(KEYS.join(" "));
  else return new Response("Not allowed", { status: 403 });
};
