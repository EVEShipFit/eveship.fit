import { loadV1Fits } from "@eveshipfit/fitting";
import type { LocalFits } from "@eveshipfit/react-hooks";

/** Moves the fits v1 kept in localStorage into `localFits`, once. */
export async function moveV1Fits(localFits: LocalFits): Promise<void> {
  const json = localStorage.getItem("fits");
  if (json === null) return;
  await Promise.all(loadV1Fits(json).map((fit) => localFits.save(fit)));
  localStorage.removeItem("fits");
  localStorage.setItem("fits-v1", json);
}
