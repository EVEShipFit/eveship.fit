import { expect, test } from "vitest";

import { placeAt, polar } from "../src/primitives/Wheel/geometry";

test("angles go clockwise from the top", () => {
  expect(polar(0, 100)).toEqual({ x: 0, y: -100 });
  expect(polar(90, 100)).toEqual({ x: 100, y: 0 });
  expect(polar(180, 100)).toEqual({ x: 0, y: 100 });
  expect(polar(-90, 100)).toEqual({ x: -100, y: 0 });
});

test("points are rounded to keep them short", () => {
  expect(polar(45, 100)).toEqual({ x: 70.711, y: -70.711 });
});

test("an element is placed as a share of the wheel", () => {
  expect(placeAt(0, 0)).toEqual({ left: "50%", top: "50%" });
  expect(placeAt(90, 232)).toEqual({ left: "100%", top: "50%" });
  expect(placeAt(180, 116)).toEqual({ left: "50%", top: "75%" });
});
