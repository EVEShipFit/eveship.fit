import { expect, test } from "vitest";

import { loadV1Fits } from "../src/index.js";

test("a v1 fit", () => {
  const fits = loadV1Fits(
    JSON.stringify([
      {
        name: "My Rifter",
        description: "",
        shipTypeId: 587,
        modules: [
          { typeId: 2873, slot: { type: "High", index: 1 }, state: "Overload", charge: { typeId: 185 } },
          { typeId: 2048, slot: { type: "Low", index: 2 }, state: "Passive" },
          { typeId: 31718, slot: { type: "Rig", index: 1 }, state: "Online" },
        ],
        drones: [{ typeId: 2454, states: { Active: 1, Passive: 2 } }],
        cargo: [{ typeId: 185, quantity: 400 }],
      },
    ]),
  );

  expect(fits).toEqual([
    {
      name: "My Rifter",
      ship: { type_id: 587 },
      items: [
        { type_id: 2873, slot: { type: "high", index: 0 }, state: "overload", charge: { type_id: 185 } },
        { type_id: 2048, slot: { type: "low", index: 1 }, state: "offline" },
        { type_id: 31718, slot: { type: "rig", index: 0 }, state: "online" },
        { type_id: 2454, slot: { type: "drone_bay" }, quantity: 1, state: "active" },
        { type_id: 2454, slot: { type: "drone_bay" }, quantity: 2, state: "offline" },
        { type_id: 185, slot: { type: "cargo" }, quantity: 400, state: "offline" },
      ],
    },
  ]);
});

test("a fit from the first releases of v1, with ESI flags", () => {
  const fits = loadV1Fits(
    JSON.stringify([
      {
        name: "Old Rifter",
        description: "",
        ship_type_id: 587,
        items: [
          { type_id: 2873, flag: 27, quantity: 1, charge: { type_id: 185 } },
          { type_id: 2048, flag: "LoSlot1", quantity: 1, state: "Online" },
          { type_id: 30987, flag: 126, quantity: 1 },
          { type_id: 2454, flag: 87, quantity: 2, state: "Passive" },
          { type_id: 185, flag: "Cargo", quantity: 400 },
          { type_id: 1, flag: 89, quantity: 1 },
        ],
      },
    ]),
  );

  expect(fits).toEqual([
    {
      name: "Old Rifter",
      ship: { type_id: 587 },
      items: [
        { type_id: 2873, slot: { type: "high", index: 0 }, state: "active", charge: { type_id: 185 } },
        { type_id: 2048, slot: { type: "low", index: 1 }, state: "online" },
        { type_id: 30987, slot: { type: "subsystem", index: 1 }, state: "active" },
        { type_id: 2454, slot: { type: "drone_bay" }, quantity: 2, state: "offline" },
        { type_id: 185, slot: { type: "cargo" }, quantity: 400, state: "offline" },
      ],
    },
  ]);
});

test("skips fits it cannot read", () => {
  const fits = loadV1Fits(
    JSON.stringify([
      { name: "No ship", modules: [], drones: [], cargo: [] },
      { name: "No modules", shipTypeId: 587 },
      { name: "Empty", shipTypeId: 587, modules: [], drones: [], cargo: [] },
    ]),
  );

  expect(fits).toEqual([{ name: "Empty", ship: { type_id: 587 }, items: [] }]);
});

test("anything but a list is no fits", () => {
  expect(loadV1Fits("{}")).toEqual([]);
});

test("skips fits with a slot or state v1 did not have", () => {
  const module = { typeId: 2048, slot: { type: "Low", index: 1 }, state: "Active" };
  const fit = (changed: object) => ({
    name: "",
    shipTypeId: 587,
    modules: [{ ...module, ...changed }],
    drones: [],
    cargo: [],
  });

  expect(loadV1Fits(JSON.stringify([fit({ slot: { type: "Service", index: 1 } }), fit({ state: "Busy" })]))).toEqual(
    [],
  );
});

test("drops items in flags v1 did not have", () => {
  const items = ["HiSlot8", "RigSlot3", 95, "SubSystemSlot4", "Implant"].map((flag) => ({
    type_id: 1,
    flag,
    quantity: 1,
  }));

  expect(loadV1Fits(JSON.stringify([{ name: "", ship_type_id: 587, items }]))).toEqual([
    { name: "", ship: { type_id: 587 }, items: [] },
  ]);
});
