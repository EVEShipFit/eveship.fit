import textsUrl from "@eveshipfit/sde/dist/texts.dat?url";
import { loadTexts, type Texts } from "@eveshipfit/sde-loader";

let texts: Promise<Texts> | undefined;

export function loadAllTexts(): Promise<Texts> {
  texts ??= loadTexts({ url: textsUrl });
  return texts;
}
