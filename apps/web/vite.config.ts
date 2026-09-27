import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { createReadStream } from "node:fs";
import { cp } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

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
  build: {
    target: "es2024",
  },
});
