# EVEShip.fit

View, create and share EVE Online ship fits: [eveship.fit](https://eveship.fit).

This repository holds the website and the packages it is built from.

## Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer.
- [pnpm](https://pnpm.io/) 10; `corepack enable` picks the right version.
- Chromium for the tests: `pnpm exec playwright install chromium` (after `pnpm install`).

## Development

```sh
pnpm install
pnpm dev         # the website
pnpm workbench   # Storybook
pnpm test
```
