---
"@eveshipfit/zkillboard": major
"@eveshipfit/react-hooks": major
"@eveshipfit/ui-ingame": major
---

Price everything with zKillboard. `ZKillboard.price()` is replaced by `prices()`, which fetches all of yesterday's prices at once. `useFitPrice` and `useTypePrice` use only the provider's `zkillboard`, and no longer the engine's `esi`; `ShipStatistics` and the item browser show prices only when `EveShipFitProvider` has a `zkillboard`
