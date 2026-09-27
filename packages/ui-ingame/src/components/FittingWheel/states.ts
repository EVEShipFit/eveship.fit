import type { SlotState } from "../../primitives/Wheel/WheelSlot";

const states: SlotState[] = ["offline", "online", "active", "overload"];

/** The state after `state` among those up to `max`, going round to offline after the last; before it with `back`. */
export function nextState(state: SlotState, max: SlotState, back = false): SlotState {
  const allowed = states.slice(0, states.indexOf(max) + 1);
  const step = back ? allowed.length - 1 : 1;
  return allowed[(allowed.indexOf(state) + step) % allowed.length]!;
}
