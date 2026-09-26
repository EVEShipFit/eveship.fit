import type { Engine, FitStore, Preview } from "@eveshipfit/fitting";
import { createContext, useContext, type Context } from "react";

import type { LocalFits } from "./local-fits.js";

export type DragItem = { type: "type"; typeId: number } | { type: "item"; ref: number };

export interface PreviewState {
  preview: Preview | undefined;
  setPreview: (preview: Preview | undefined) => void;
}

export interface DragState {
  dragging: DragItem | undefined;
  setDragging: (item: DragItem | undefined) => void;
}

export interface CharacterState {
  /** The ID of the character flying the fit, as `useCharacters` lists it. */
  current: string;
  setCurrent: (id: string) => void;
}

export const EngineContext = createContext<Engine | undefined>(undefined);
export const FitContext = createContext<FitStore | undefined>(undefined);
export const PreviewContext = createContext<PreviewState | undefined>(undefined);
export const DragContext = createContext<DragState | undefined>(undefined);
export const CharacterContext = createContext<CharacterState | undefined>(undefined);
export const LocalFitsContext = createContext<LocalFits | undefined>(undefined);

/** Like `useContext`, but throws outside the provider instead of returning `undefined`. */
export function useRequiredContext<T>(context: Context<T | undefined>): T {
  const value = useContext(context);
  if (value === undefined) throw new Error("This hook needs to be inside an <EveShipFitProvider>");
  return value;
}
