import { expect, test } from "vitest";

import { nextState } from "../src/components/FittingWheel/states";

test("a module goes round the states it can reach", () => {
  expect(nextState("offline", "overload")).toBe("online");
  expect(nextState("online", "overload")).toBe("active");
  expect(nextState("active", "overload")).toBe("overload");
  expect(nextState("overload", "overload")).toBe("offline");

  expect(nextState("offline", "online")).toBe("online");
  expect(nextState("online", "online")).toBe("offline");

  expect(nextState("active", "active")).toBe("offline");
});

test("backwards, a module goes round the other way", () => {
  expect(nextState("offline", "overload", true)).toBe("overload");
  expect(nextState("active", "overload", true)).toBe("online");
  expect(nextState("offline", "online", true)).toBe("online");
});
