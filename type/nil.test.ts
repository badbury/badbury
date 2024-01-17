import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { nil } from "./nil.ts";

Deno.test("null().make()", () => {
  const type = nil();

  assertEquals(type.make(null), null);

  // @ts-expect-error "Invalid make type"
  type.make("hi");
});

Deno.test("null().is()", () => {
  const type = nil();

  assertEquals(type.is(null), true);

  assertEquals(type.is("hi"), false);
});
