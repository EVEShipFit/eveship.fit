import { useSde, useType } from "@eveshipfit/react-hooks";

/** Whether a type has an effect, by its name. */
export function useHasEffect(typeId: number, name: string): boolean {
  const sde = useSde();
  const type = useType(typeId);
  return [...(type?.effectIds ?? [])].some((id) => sde.effect(id)?.name === name);
}
