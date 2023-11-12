const path = require("path")

module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "airbnb-typescript",
    "airbnb/hooks",
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react/recommended",
    "prettier",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
    "prettier",
    "react",
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  rules: {
    "newline-per-chained-call": "off",
    "react/jsx-pascal-case": "off",
    "react/require-default-props": "off",
  },
  parserOptions: {
    project: "./tsconfig.json",
  },
  overrides: [],
}
