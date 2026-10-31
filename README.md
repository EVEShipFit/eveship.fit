# EVEShip.fit

View, create and share EVE Online ship fits: [eveship.fit](https://eveship.fit).

This repository holds the website and the packages it is built from. The packages are published to npm, so you can use
them on your own site too.

## Using EVEShip.fit on your own site

- [docs/embedding.md](docs/embedding.md): show the fitting wheel on your own site, step by step.
- [docs/migration.md](docs/migration.md): move from `@eveshipfit/react` (v1) to the v2 packages.

## What's in here

### Packages

| Package                                           | What it does                                            |
| ------------------------------------------------- | ------------------------------------------------------- |
| [`@eveshipfit/fitting`](packages/fitting)         | Ship fits that recalculate themselves.                  |
| [`@eveshipfit/react-hooks`](packages/react-hooks) | React provider and hooks over `@eveshipfit/fitting`.    |
| [`@eveshipfit/ui-ingame`](packages/ui-ingame)     | React components that look like the in-game fitting UI. |
| [`@eveshipfit/sde-loader`](packages/sde-loader)   | Typed lookups into EVE's static data (the SDE).         |
| [`@eveshipfit/esi`](packages/esi)                 | A small client for ESI, EVE Online's API.               |
| [`@eveshipfit/zkillboard`](packages/zkillboard)   | A small client for zKillboard's API.                    |

Each package has its own README with install and usage examples.

### Apps

| App                                | What it is                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| [`apps/web`](apps/web)             | The website, [eveship.fit](https://eveship.fit). Runs on Cloudflare Workers.   |
| [`apps/storybook`](apps/storybook) | The component gallery, [storybook.eveship.fit](https://storybook.eveship.fit). |

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or newer.
- [pnpm](https://pnpm.io/) 10; `corepack enable` picks the right version.
- Chromium for the tests: `pnpm exec playwright install chromium` (after `pnpm install`).

## Development

```sh
pnpm install
pnpm dev         # the website, on http://localhost:5173/
pnpm storybook   # the component gallery
pnpm test        # unit and component tests
```

Before you open a pull request:

```sh
pnpm format      # format the code
pnpm lint
pnpm typecheck
```

### Logging in with EVE locally

`pnpm dev` runs on `http://localhost:5173/`, the callback URL of the client ID in `apps/web/.env.development`, so
logging in with EVE works locally.

The website's build takes its client ID from `VITE_ESI_CLIENT_ID`.

## Releases and deploys

- Every pull request that changes a published package needs a changeset: run `pnpm changeset`. See
  [.changeset/README.md](.changeset/README.md).
- Every pull request gets a preview of the website and Storybook.
- A push to `main` deploys [next.eveship.fit](https://next.eveship.fit) and
  [storybook.eveship.fit](https://storybook.eveship.fit).
- Publishing a GitHub release deploys [eveship.fit](https://eveship.fit).

## License

[MIT](LICENSE).
