# EVEShip.fit

View, create and share EVE Online ship fits: [eveship.fit](https://eveship.fit).

This repository holds the website and the packages it is built from.

To show fits on your own site, see [docs/embedding.md](docs/embedding.md); moving from `@eveshipfit/react`, see
[docs/migration.md](docs/migration.md).

## Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer.
- [pnpm](https://pnpm.io/) 10; `corepack enable` picks the right version.
- Chromium for the tests: `pnpm exec playwright install chromium` (after `pnpm install`).

## Development

```sh
pnpm install
pnpm dev         # the website
pnpm storybook
pnpm test
```

`pnpm dev` runs on `http://localhost:5173/`, the callback URL of the client ID in `apps/web/.env.development`, so
logging in with EVE works locally. The website's build takes its client ID from `VITE_ESI_CLIENT_ID`; CI sets it from
the `ESI_CLIENT_ID` repository variable when deploying.
