import type { Fit, FitItem, State } from "./types.js";

type V1State = "Passive" | "Online" | "Active" | "Overload" | "Preview";
type V1Rack = "High" | "Medium" | "Low" | "Rig" | "SubSystem";
type V1Slot = { type: V1Rack; index: number };

interface V1Fit {
  name: string;
  shipTypeId: number;
  modules: { typeId: number; slot: V1Slot; state: V1State; charge?: { typeId: number } }[];
  drones: { typeId: number; states: { Active: number; Passive: number } }[];
  cargo: { typeId: number; quantity: number }[];
}

/** A fit as the first releases of v1 kept it. */
interface V1EsiFit {
  name: string;
  ship_type_id: number;
  items: { type_id: number; flag: number | string; quantity: number; state?: V1State; charge?: { type_id: number } }[];
}

const states: Record<V1State, State> = {
  Passive: "offline",
  Online: "online",
  Active: "active",
  Overload: "overload",
  Preview: "active",
};

const racks: Record<V1Rack, "high" | "medium" | "low" | "rig" | "subsystem"> = {
  High: "high",
  Medium: "medium",
  Low: "low",
  Rig: "rig",
  SubSystem: "subsystem",
};

/** The fits v1 kept in localStorage; skips those it cannot read. */
export function loadV1Fits(json: string): Fit[] {
  const fits: unknown = JSON.parse(json);
  if (!Array.isArray(fits)) return [];
  return fits.flatMap((fit: V1Fit | V1EsiFit) => {
    try {
      return [loadV1Fit(fit)];
    } catch {
      return [];
    }
  });
}

function loadV1Fit(fit: V1Fit | V1EsiFit): Fit {
  const v1 = "ship_type_id" in fit ? fromEsi(fit) : fit;
  if (typeof v1.shipTypeId !== "number") throw new Error("A fit without a ship");

  const items: FitItem[] = [
    ...v1.modules.map(({ typeId, slot, state, charge }): FitItem => ({
      type_id: typeId,
      slot: { type: known(racks[slot.type]), index: slot.index - 1 },
      state: known(states[state]),
      ...(charge && { charge: { type_id: charge.typeId } }),
    })),
    ...v1.drones.flatMap(({ typeId, states: { Active, Passive } }) => [
      ...(Active > 0 ? [drones(typeId, Active, "active")] : []),
      ...(Passive > 0 ? [drones(typeId, Passive, "offline")] : []),
    ]),
    ...v1.cargo.map(({ typeId, quantity }): FitItem => ({
      type_id: typeId,
      slot: { type: "cargo" },
      quantity,
      state: "offline",
    })),
  ];
  return { name: v1.name, ship: { type_id: v1.shipTypeId }, items };
}

function known<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Not a v1 slot or state");
  return value;
}

function drones(typeId: number, quantity: number, state: State): FitItem {
  return { type_id: typeId, slot: { type: "drone_bay" }, quantity, state };
}

function fromEsi(fit: V1EsiFit): V1Fit {
  const v1: V1Fit = { name: fit.name, shipTypeId: fit.ship_type_id, modules: [], drones: [], cargo: [] };
  for (const item of fit.items) {
    const slot = flagSlot(item.flag);
    if (slot === "cargo") {
      v1.cargo.push({ typeId: item.type_id, quantity: item.quantity });
    } else if (slot === "drone_bay") {
      const passive = item.state === "Passive";
      v1.drones.push({
        typeId: item.type_id,
        states: { Active: passive ? 0 : item.quantity, Passive: passive ? item.quantity : 0 },
      });
    } else if (slot !== undefined) {
      v1.modules.push({
        typeId: item.type_id,
        slot,
        state: item.state ?? "Active",
        ...(item.charge && { charge: { typeId: item.charge.type_id } }),
      });
    }
  }
  return v1;
}

const flagRanges: [string, V1Rack, number, number][] = [
  ["Lo", "Low", 11, 8],
  ["Med", "Medium", 19, 8],
  ["Hi", "High", 27, 8],
  ["Rig", "Rig", 92, 3],
  ["SubSystem", "SubSystem", 125, 4],
];

function flagSlot(flag: number | string): V1Slot | "cargo" | "drone_bay" | undefined {
  if (flag === 5 || flag === "Cargo") return "cargo";
  if (flag === 87 || flag === "DroneBay") return "drone_bay";
  const named = typeof flag === "string" ? /^(\w+?)Slot(\d)$/.exec(flag) : null;
  for (const [prefix, type, first, count] of flagRanges) {
    const index = typeof flag === "number" ? flag - first : named?.[1] === prefix ? Number(named[2]) : -1;
    if (index >= 0 && index < count) return { type, index: index + 1 };
  }
  return undefined;
}
