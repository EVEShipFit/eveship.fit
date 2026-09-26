import babel from "@rolldown/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig({
  plugins: [babel({ plugins: ["babel-plugin-react-compiler"] })],
  css: { inject: true },
  // The theme is separate so that a site can load its own instead.
  copy: ["src/theme.css"],
});
