---
"@eveshipfit/fitting": minor
---

The history of a `FitStore` keeps every fit: `goTo` goes back to one, and an edit from there goes at the end instead of dropping what came after. `undo` and `redo` step through that list, so after going back and editing, `undo` shows the fit that was last at the end, not the one the edit was made from. It holds the last 25 fits instead of 100 undo steps, and says how many in `historyLength` and which is shown in `historyPosition`. `Stats` has the drone bay's usage in `droneBay`
