import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type TestProjectInlineConfiguration } from "vitest/config";

function nodePackage(name: string): TestProjectInlineConfiguration {
  return { test: { name, root: `packages/${name}`, environment: "node" } };
}

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      nodePackage("sde-loader"),
      nodePackage("fitting"),
      nodePackage("react-hooks"),
      {
        plugins: [storybookTest({ configDir: "apps/workbench/.storybook" })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
