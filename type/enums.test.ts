import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { enums } from "./enums.ts";

Deno.test('enums([1, true, "three"]).make()', () => {
  const type = enums([1, true, "three"]);

  assertEquals(type.make(1), 1);
  assertEquals(type.make(true), true);
  assertEquals(type.make("three"), "three");

  // @ts-expect-error "Invalid make type"
  type.make("foo");
  // @ts-expect-error "Invalid make type"
  type.make(2);
  // @ts-expect-error "Invalid make type"
  type.make(false);
});

Deno.test('enums([1, true, "three"]).is()', () => {
  const type = enums([1, true, "three"]);

  assertEquals(type.is(1), true);
  assertEquals(type.is(true), true);
  assertEquals(type.is("three"), true);

  assertEquals(type.is("foo"), false);
  assertEquals(type.is(2), false);
  assertEquals(type.is(false), false);
});
