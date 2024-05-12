# EVEShip.fit

This repository contains the website as shown on [https://eveship.fit](https://eveship.fit).

It is a NextJS project, and depends on the [ESF React Component Library](https://github.com/EVEShipFit/react) for all visuals.

## Development

Make sure you are authentication against the GitHub NPM.
See [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages) for instructions.

```bash
npm install
npm run dev
```

This will start a NextJS development server, which allows you to view the website.
It will reload automatically on changes to the code.

### Linting and coding style

Each Pull Request is validated by a linter.
To run this locally:

```bash
npm run lint
```
