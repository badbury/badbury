import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { tuple } from "./tuple.ts";
import { number } from "./number.ts";
import { string } from "./string.ts";

Deno.test("tuple([number(), string()]).make()", () => {
  const type = tuple([number(), string()]);

  assertEquals(type.make([1234, "hi"]), [1234, "hi"]);
  // @ts-expect-error "Invalid make type"
  type.make(true);
  // @ts-expect-error "Invalid make type"
  type.make([1234]);
  // @ts-expect-error "Invalid make type"
  type.make([]);
  // @ts-expect-error "Invalid make type"
  type.make(["hi", 1234]);
  // @ts-expect-error "Invalid make type"
  type.make([1234, "hi", 5678]);
});

Deno.test("tuple([number(), string()]).is()", () => {
  const type = tuple([number(), string()]);

  assertEquals(type.is([1234, "hi"]), true);
  assertEquals(type.is(true), false);
  assertEquals(type.is([1234]), false);
  assertEquals(type.is([]), false);
  assertEquals(type.is(["hi", 1234]), false);
  assertEquals(type.is([1234, "hi", 5678]), false);
});
