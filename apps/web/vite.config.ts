import { Images } from "@eveshipfit/images";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { createReadStream, readFileSync } from "node:fs";
import { cp } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const version =
  process.env.EVESHIPFIT_VERSION ||
  (JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as { version: string }).version;
const packageVersion = (name: string) =>
  (
    JSON.parse(readFileSync(new URL(`node_modules/${name}/package.json`, import.meta.url), "utf8")) as {
      version: string;
    }
  ).version;
const imagesDir = fileURLToPath(new URL("node_modules/@eveshipfit/images/dist/images", import.meta.url));

/** Serves the images of `@eveshipfit/images` at /images/, and copies them into the build. */
function images(): Plugin {
  return {
    name: "eveshipfit-images",
    configureServer(server) {
      server.middlewares.use("/images", (req, res, next) => {
        const name = /^\/([0-9a-f]+\.webp)(?:\?|$)/.exec(req.url ?? "")?.[1];
        if (name === undefined) return next();
        res.setHeader("Content-Type", "image/webp");
        createReadStream(join(imagesDir, name))
          .on("error", () => next())
          .pipe(res);
      });
    },
    async writeBundle({ dir }) {
      await cp(imagesDir, join(dir!, "images"), { recursive: true });
    },
  };
}

const wheelTextures = [
  "classes/fitting/fittingbase",
  "classes/fitting/fittingbase_dotproduct",
  "classes/fitting/fittingbase_overlay",
];

/** Preloads the data files, the WASM, and the textures of the empty fitting wheel. */
function preload(): Plugin {
  const index = new Images(new Uint8Array(readFileSync(join(imagesDir, "..", "images.dat"))), { baseUrl: "/images/" });
  const textures = wheelTextures.map((name) => {
    const url = index.uiTexture(name);
    if (url === undefined) throw new Error(`No UI texture ${name}`);
    return url;
  });

  return {
    name: "eveshipfit-preload",
    transformIndexHtml: {
      order: "post",
      handler(_html, { bundle, path }) {
        if (bundle === undefined || path === "/404.html") return;
        return [
          ...textures.map((href) => ({
            tag: "link",
            attrs: { rel: "preload", href, as: "image", fetchpriority: "high" },
            injectTo: "head" as const,
          })),
          ...Object.values(bundle)
            .filter((file) => file.type === "asset" && /\.(dat|wasm)$/.test(file.fileName))
            .map((file) => ({
              tag: "link",
              attrs: {
                rel: "preload",
                href: `/${file.fileName}`,
                as: "fetch",
                crossorigin: "",
                ...(file.type === "asset" && file.names.includes("sde.dat") && { fetchpriority: "low" }),
              },
              injectTo: "head" as const,
            })),
        ];
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), images(), preload()],
  define: {
    "import.meta.env.EVESHIPFIT_VERSION": JSON.stringify(version),
    "import.meta.env.EVESHIPFIT_SDE_VERSION": JSON.stringify(packageVersion("@eveshipfit/sde")),
    "import.meta.env.EVESHIPFIT_IMAGES_VERSION": JSON.stringify(packageVersion("@eveshipfit/images")),
  },
  build: {
    target: "es2024",
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        og: fileURLToPath(new URL("og.html", import.meta.url)),
        notFound: fileURLToPath(new URL("404.html", import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
