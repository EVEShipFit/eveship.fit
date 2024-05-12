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

## Import fits via URL

When working with EVEShip.fit, the URL is automatically adjusted to represent the current fit you are working on.
This means that you can always share the link to anyone else, and when opening, they will see the exact same fit, with the exact same configuration.

The format of the URL is always the same: `#fit:<type>:<data>`.

Types of the form `v1`, `v2`, etc are EVEShip.fit's internal format, which is based on ESI JSON (but extended to store more information, like state, charges, etc).
Next to that, there are other types meant to make it easier for other tools to generate URLs to point to a specific fit.

### Killmails

URLs in the format `#fit:killmail:<killmail_id>/<killmail_hash>` will cause EVEShip.fit to automatically import the fit based on the killmail.

### EFT

URLs in the format `#fit:eft:<base64-encoded-gzip-compressed-eft-strings>` will cause EVEShip.fit to automatically import the EFT fit.

EFT is a human readable representation of a fit, commonly used to import/export fits into EVE itself.
EVEShip.fit supports importing those fits directly from the URL (but also via the website itself).

To keep the URLs small and manageable, the following has to be done:

- gzip compressed the EFT fit
- base64 encode the gzip result

In bash, it would look something like this:

```
cat <<EOF | gzip | base64 -w 0
[Cheetah, My Cheetah]
Overdrive Injector System II
Nanofiber Internal Structure II
Nanofiber Internal Structure II
Co-Processor II

5MN Y-T8 Compact Microwarpdrive
Scan Pinpointing Array I
Cargo Scanner II
Data Analyzer II

Sisters Expanded Probe Launcher
Interdiction Nullifier I
Covert Ops Cloaking Device II

Small Gravity Capacitor Upgrade I
Small Ancillary Current Router II
EOF
```

Add `https://eveship.fit/#fit:eft:` in front of this, and you have a working URL to import an EFT fit.
