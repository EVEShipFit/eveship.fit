import type { Slot } from "@eveshipfit/fitting";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo } from "react";

import { InfoContext, useRequiredContext, type InfoTarget } from "../context.js";
import { formatAttribute } from "../format.js";
import { useSnapshot } from "./fit.js";
import { useSde } from "./sde.js";

export interface InfoAttribute {
  readonly id: number;
  readonly name: string;
  readonly text: string;
  /** How the fit changes the value, if it does. */
  readonly change: "better" | "worse" | undefined;
}

export interface Info {
  readonly type: SdeType | undefined;
  /** Where the target is fitted, as a module or as the charge loaded in it. */
  readonly fitted: { readonly slot: Slot; readonly charge: boolean } | undefined;
  /** The published ones; on the fit when fitted, else as the SDE has them. */
  readonly attributes: readonly InfoAttribute[];
}

export interface ShowInfo {
  readonly shown: InfoTarget | undefined;
  readonly show: (target: InfoTarget) => void;
  readonly close: () => void;
}

export function useShowInfo(): ShowInfo {
  const { shown, setShown } = useRequiredContext(InfoContext);
  return { shown, show: setShown, close: () => setShown(undefined) };
}

export function useInfo(target: InfoTarget): Info {
  const sde = useSde();
  const { fit, stats } = useSnapshot();
  const { typeId, ref } = target;
  const type = sde.type(typeId);
  const item = ref === undefined ? undefined : fit.items[ref];
  const charge = item !== undefined && item.type_id !== typeId && item.charge?.type_id === typeId;
  const fitted = item !== undefined && (item.type_id === typeId || charge) ? { slot: item.slot, charge } : undefined;
  const itemStats = fitted && ref !== undefined ? stats.items[ref] : undefined;
  const onFit = charge ? itemStats?.charge : itemStats?.attributes;

  const attributes = useMemo(() => {
    const rows: InfoAttribute[] = [];
    for (const [id, base] of type?.attributes ?? []) {
      const attribute = sde.attribute(id);
      if (!attribute?.published || attribute.displayName === undefined) continue;
      const value = onFit?.get(id) ?? base;
      const text = formatAttribute(sde, id, value);
      const changed = text !== formatAttribute(sde, id, base);
      rows.push({
        id,
        name: attribute.displayName,
        text,
        change: changed ? (value > base === attribute.highIsGood ? "better" : "worse") : undefined,
      });
    }
    return rows;
  }, [sde, type, onFit]);

  return { type, fitted, attributes };
}
