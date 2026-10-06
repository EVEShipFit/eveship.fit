import type { EsiCharacters } from "@eveshipfit/react-hooks";

/** Moves the characters v1 kept in localStorage into `characters`, once. */
export function moveV1Characters(characters: EsiCharacters) {
  const names = JSON.parse(localStorage.getItem("characters") ?? "{}") as Record<string, { name?: string }>;
  const refreshTokens = JSON.parse(localStorage.getItem("refreshTokens") ?? "{}") as Record<string, string>;
  characters.add(
    Object.entries(refreshTokens).flatMap(([id, refreshToken]) => {
      const name = names[id]?.name;
      return Number(id) && name !== undefined ? [{ id: Number(id), name, refreshToken }] : [];
    }),
  );
  localStorage.removeItem("characters");
  localStorage.removeItem("refreshTokens");
}
