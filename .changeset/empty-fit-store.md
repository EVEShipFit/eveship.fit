---
"@eveshipfit/fitting": minor
"@eveshipfit/react-hooks": minor
"@eveshipfit/ui-ingame": major
---

Add an empty fit store, `createFit()`, for before a hull is picked. `ItemBrowser` drops `noHullSelected`; `FittingWindow` shows its `placeholder` (by default "Pick a hull to start.") only while the store is empty, and ignores it otherwise
