import type { Engine, FitStore, Preview } from "@eveshipfit/fitting";
import type { ZKillboard } from "@eveshipfit/zkillboard";
import { useRef, useState, type ReactNode } from "react";

import {
  CharacterContext,
  DragContext,
  EngineContext,
  EsiCharactersContext,
  FitContext,
  LocalFitsContext,
  PreviewContext,
  ZKillboardContext,
  type DragItem,
  type PreviewState,
} from "./context.js";
import type { EsiCharacters } from "./esi-characters.js";
import { ALL_SKILLS_V, useFlyCharacter } from "./hooks/characters.js";
import { LocalFits } from "./local-fits.js";

const RIFTER = 587;

export interface EveShipFitProviderProps {
  engine: Engine;
  /** The fit to show and edit; an empty Rifter when left out. */
  fit?: FitStore;
  /** Where saved fits live; IndexedDB when left out. */
  localFits?: LocalFits;
  /** Characters logged in through EVE's login. */
  characters?: EsiCharacters;
  /** Who flies the fit at first, as `useCharacters` lists it; All L5 when left out. */
  character?: string;
  /** Prices what ESI has none for. */
  zkillboard?: ZKillboard;
  children?: ReactNode;
}

export function EveShipFitProvider({
  engine,
  fit,
  localFits,
  characters,
  character: firstCharacter,
  zkillboard,
  children,
}: EveShipFitProviderProps) {
  const [ownFit] = useState(() => fit ?? engine.createFit({ ship: RIFTER }));
  const [ownLocalFits] = useState(() => localFits ?? new LocalFits());
  const [preview, setPreview] = useState<Preview>();
  const previewTarget = useRef<string>(undefined);
  const previewState: PreviewState = {
    preview,
    show: (next, target) => {
      previewTarget.current = target;
      setPreview(next);
    },
    clear: (target) => {
      if (target !== undefined && previewTarget.current !== target) return;
      previewTarget.current = undefined;
      setPreview(undefined);
    },
  };
  const [dragging, setDragging] = useState<DragItem>();
  const [character, setCharacter] = useState(firstCharacter ?? ALL_SKILLS_V);
  useFlyCharacter(engine, fit ?? ownFit, characters, character, firstCharacter !== undefined);

  return (
    <EngineContext value={engine}>
      <FitContext value={fit ?? ownFit}>
        <LocalFitsContext value={localFits ?? ownLocalFits}>
          <EsiCharactersContext value={characters}>
            <CharacterContext value={{ current: character, setCurrent: setCharacter }}>
              <PreviewContext value={previewState}>
                <DragContext value={{ dragging, setDragging }}>
                  <ZKillboardContext value={zkillboard}>{children}</ZKillboardContext>
                </DragContext>
              </PreviewContext>
            </CharacterContext>
          </EsiCharactersContext>
        </LocalFitsContext>
      </FitContext>
    </EngineContext>
  );
}
