import type { Context } from "@netlify/edge-functions";

export type EdgeKeys = {
  apiKey?: string;
  clientId?: string;
};

export default function getKeys(_: Request, { site }: Context) {
  if (site.url !== Netlify.env.get("SITE_URL"))
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });

  const KEYS: EdgeKeys = {
    apiKey: Netlify.env.get("GOOGLE_API_KEY"),
    clientId: Netlify.env.get("GOOGLE_CLIENT_ID"),
  };
  return new Response(JSON.stringify(KEYS), { status: 200 });
}
