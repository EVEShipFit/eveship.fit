interface Env {
  ASSETS: Fetcher;
  VERSION: WorkerVersionMetadata;
}

const PREVIEW = "https://preview.eveship.fit/og.png";
const WIDTH = 1200;
const HEIGHT = 630;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fit = url.searchParams.get("fit");
    if (url.pathname === "/" && fit !== null) return fitPage(url, fit, env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

/** The website, with the fit's image as its OG image. */
async function fitPage(url: URL, fit: string, env: Env) {
  const page = await env.ASSETS.fetch(new URL("/", url));
  const image = new URL(PREVIEW);
  image.searchParams.set("site", url.hostname);
  image.searchParams.set("v", env.VERSION.id);
  image.searchParams.set("fit", fit);
  const response = new HTMLRewriter()
    .on("head", {
      element(head) {
        head.append(
          `<meta property="og:image" content="${image.href.replaceAll("&", "&amp;")}" />` +
            `<meta property="og:image:width" content="${WIDTH}" />` +
            `<meta property="og:image:height" content="${HEIGHT}" />`,
          { html: true },
        );
      },
    })
    .transform(page);
  const rewritten = new Response(response.body, response);
  rewritten.headers.delete("ETag");
  return rewritten;
}
