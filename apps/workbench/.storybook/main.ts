import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    { directory: "../../../packages/react-hooks/src", titlePrefix: "react-hooks" },
    { directory: "../../../packages/ui-ingame/src", titlePrefix: "ui-ingame" },
  ],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
};

export default config;
