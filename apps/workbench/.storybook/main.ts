import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../../../packages/*/src/**/*.stories.tsx"],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
};

export default config;
