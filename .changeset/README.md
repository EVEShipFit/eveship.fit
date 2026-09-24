# Changesets

Run `pnpm changeset` to describe a change to a published package. On `main`, the release workflow turns pending
changesets into a "Version Packages" pull request; merging that publishes to npmjs.

CI requires a changeset in every pull request that changes a published package. If the change needs no release, add an
empty one with `pnpm changeset --empty`.
