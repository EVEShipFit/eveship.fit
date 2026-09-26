import type { Engine, FitStore, Preview } from "@eveshipfit/fitting";
import { useState, type ReactNode } from "react";

import {
  CharacterContext,
  DragContext,
  EngineContext,
  FitContext,
  LocalFitsContext,
  PreviewContext,
  type DragItem,
} from "./context.js";
import { ALL_SKILLS_V } from "./hooks/characters.js";
import { LocalFits } from "./local-fits.js";

const RIFTER = 587;

export interface EveShipFitProviderProps {
  engine: Engine;
  /** The fit to show and edit; an empty Rifter when left out. */
  fit?: FitStore;
  /** Where saved fits live; `localStorage` when left out. */
  localFits?: LocalFits;
  children?: ReactNode;
}

export function EveShipFitProvider({ engine, fit, localFits, children }: EveShipFitProviderProps) {
  const [ownFit] = useState(() => fit ?? engine.createFit({ ship: RIFTER }));
  const [ownLocalFits] = useState(() => localFits ?? new LocalFits());
  const [preview, setPreview] = useState<Preview>();
  const [dragging, setDragging] = useState<DragItem>();
  const [character, setCharacter] = useState(ALL_SKILLS_V);

  return (
    <EngineContext value={engine}>
      <FitContext value={fit ?? ownFit}>
        <LocalFitsContext value={localFits ?? ownLocalFits}>
          <CharacterContext value={{ current: character, setCurrent: setCharacter }}>
            <PreviewContext value={{ preview, setPreview }}>
              <DragContext value={{ dragging, setDragging }}>{children}</DragContext>
            </PreviewContext>
          </CharacterContext>
        </LocalFitsContext>
      </FitContext>
    </EngineContext>
  );
}
