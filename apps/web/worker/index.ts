import { launch } from "@cloudflare/puppeteer";

interface Env {
  ASSETS: Fetcher;
  BROWSER: Fetcher;
  VERSION: WorkerVersionMetadata;
}

const WIDTH = 1200;
const HEIGHT = 630;
const READY_TIMEOUT = 15_000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const fit = url.searchParams.get("fit");
    if (url.pathname === "/" && fit !== null) return fitPage(url, fit, env);
    if (url.pathname === "/og.jpg" && fit !== null) return ogImage(url, fit, env, ctx);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

/** The website, with the fit's image as its OG image. */
async function fitPage(url: URL, fit: string, env: Env) {
  const page = await env.ASSETS.fetch(new URL("/", url));
  const image = new URL("/og.jpg", url);
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

/** The OG image of the fit, from the cache or rendered by Browser Run. */
async function ogImage(url: URL, fit: string, env: Env, ctx: ExecutionContext) {
  const key = new URL("/og.jpg", url);
  key.searchParams.set("v", env.VERSION.id);
  key.searchParams.set("fit", fit);

  const cached = await caches.default.match(key);
  if (cached !== undefined) {
    console.log({ og: "hit" });
    return cached;
  }

  const start = Date.now();
  let response: Response;
  try {
    const image = await render(new URL("/og", url), fit, env);
    response =
      image === null
        ? new Response("This fit could not load.", {
            status: 404,
            headers: { "Cache-Control": "public, max-age=86400" },
          })
        : new Response(image, {
            headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
          });
  } catch (error) {
    console.error({ og: "failed", ms: Date.now() - start, error: String(error) });
    return new Response("The image could not be made.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  console.log({ og: "miss", ms: Date.now() - start, status: response.status });
  ctx.waitUntil(caches.default.put(key, response.clone()));
  return response;
}

/** A screenshot of the OG page of the fit; null when the fit does not load. */
async function render(page: URL, fit: string, env: Env) {
  page.searchParams.set("fit", fit);
  const browser = await launch(env.BROWSER);
  try {
    const tab = await browser.newPage();
    await tab.setViewport({ width: WIDTH, height: HEIGHT });
    await tab.goto(page.href);
    await tab.waitForSelector("body[data-ready]", { timeout: READY_TIMEOUT });
    const ready = await tab.$eval("body", (body) => body.dataset.ready);
    if (ready !== "true") return null;
    return await tab.screenshot({ type: "jpeg", quality: 90 });
  } finally {
    await browser.close();
  }
}
