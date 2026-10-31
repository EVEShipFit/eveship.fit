# EVEShip.fit

View, create and share EVE Online ship fits: [eveship.fit](https://eveship.fit).

This repository holds the website and the packages it is built from.

To show fits on your own site, see [docs/embedding.md](docs/embedding.md).

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or newer.
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
the `ESI_CLIENT_ID_NEXT` repository variable for `next.eveship.fit`, and `ESI_CLIENT_ID_PRODUCTION` for
`eveship.fit`.

## Link previews

Fit links (`/?fit=...`) get an image of the fit when shared, made by the website's Worker with
[Browser Run](https://developers.cloudflare.com/browser-run/). The Worker only runs on `/_fit` and `/og.jpg`; a
Transform Rule on the `eveship.fit` zone sends fit links to `/_fit`:

- Rules → Transform Rules → Rewrite URL → Create rule
- Custom filter expression:
  `(http.host in {"eveship.fit" "next.eveship.fit"} and http.request.uri.path eq "/" and any(http.request.uri.args.names[*] eq "fit"))`
- Path: Rewrite to, Static, `/_fit`
- Query: Preserve
