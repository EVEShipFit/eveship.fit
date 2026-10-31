import type { Engine, FitStore, ItemRef, Preview, Rack } from "@eveshipfit/fitting";
import type { Images } from "@eveshipfit/images";
import type { Texts } from "@eveshipfit/sde-loader";
import type { ZKillboard } from "@eveshipfit/zkillboard";
import { createContext, useContext, type Context } from "react";

import type { DamageProfiles } from "./damage-profiles.js";
import type { EsiCharacters } from "./esi-characters.js";
import type { LocalFits } from "./local-fits.js";

export type DragItem =
  | { type: "type"; typeId: number }
  | { type: "hull"; typeId: number }
  | { type: "item"; ref: number };

export interface PreviewState {
  preview: Preview | undefined;
  show: (preview: Preview, target: string | undefined) => void;
  /** With `target`, only when that target showed the preview. */
  clear: (target: string | undefined) => void;
}

export interface DragState {
  dragging: DragItem | undefined;
  setDragging: (item: DragItem | undefined) => void;
}

/** A rack, or an implant or booster slot; a booster slot without `index` is the next free one. */
export type BrowseTarget = Rack | { readonly type: "implant" | "booster"; readonly index?: number };

export interface BrowseRequest {
  readonly target: BrowseTarget;
}

export interface BrowseState {
  request: BrowseRequest | undefined;
  setRequest: (request: BrowseRequest) => void;
}

export interface Refusal {
  readonly typeId: number;
}

export interface RefusalState {
  refusal: Refusal | undefined;
  setRefusal: (refusal: Refusal) => void;
}

/** A type to show the info of; with `ref`, as fitted there (as module or its charge) or as the fit's ship. */
export interface InfoTarget {
  readonly typeId: number;
  readonly ref?: ItemRef | "ship";
}

/** What the info points at, and on which side of it. */
export interface InfoAnchor {
  readonly element: Element;
  readonly side: "left" | "right";
}

export interface ShownInfo {
  readonly target: InfoTarget;
  readonly anchor?: InfoAnchor;
}

export interface InfoState {
  shown: ShownInfo | undefined;
  setShown: (shown: ShownInfo | undefined) => void;
}

export interface CharacterState {
  /** The ID of the character flying the fit, as `useCharacters` lists it. */
  current: string;
  setCurrent: (id: string) => void;
}

export interface DamageProfileState {
  /** The name of the profile the ehp is for; undefined for uniform. */
  current: string | undefined;
  setCurrent: (name: string | undefined) => void;
}

export const EngineContext = createContext<Engine | undefined>(undefined);
export const FitContext = createContext<FitStore | undefined>(undefined);
export const PreviewContext = createContext<PreviewState | undefined>(undefined);
export const DragContext = createContext<DragState | undefined>(undefined);
export const BrowseContext = createContext<BrowseState | undefined>(undefined);
export const RefusalContext = createContext<RefusalState | undefined>(undefined);
export const InfoContext = createContext<InfoState | undefined>(undefined);
export const CharacterContext = createContext<CharacterState | undefined>(undefined);
export const DamageProfileContext = createContext<DamageProfileState | undefined>(undefined);
export const DamageProfilesContext = createContext<DamageProfiles | undefined>(undefined);
export const EsiCharactersContext = createContext<EsiCharacters | undefined>(undefined);
export const LocalFitsContext = createContext<LocalFits | undefined>(undefined);
export const ImagesContext = createContext<Images | undefined>(undefined);
export const TextsContext = createContext<Texts | undefined>(undefined);
export const ZKillboardContext = createContext<ZKillboard | undefined>(undefined);

/** Like `useContext`, but throws outside the provider instead of returning `undefined`. */
export function useRequiredContext<T>(context: Context<T | undefined>, provider = "EveShipFitProvider"): T {
  const value = useContext(context);
  if (value === undefined) throw new Error(`This hook needs to be inside an <${provider}>`);
  return value;
}
