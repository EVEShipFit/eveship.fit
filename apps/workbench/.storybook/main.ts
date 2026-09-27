import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    { directory: "../../../packages/react-hooks/src", titlePrefix: "react-hooks" },
    { directory: "../../../packages/ui-ingame/src", titlePrefix: "ui-ingame" },
  ],
  staticDirs: [{ from: "../node_modules/@eveshipfit/images/dist/images", to: "/images" }],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
};

export default config;
