import babel from "@rolldown/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig({
  plugins: [babel({ plugins: ["babel-plugin-react-compiler"] })],
});
