import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { createReadStream, readFileSync } from "node:fs";
import { cp } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const { version } = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as { version: string };
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

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), images()],
  define: {
    "import.meta.env.EVESHIPFIT_VERSION": JSON.stringify(version),
  },
  build: {
    target: "es2024",
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        og: fileURLToPath(new URL("og.html", import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
