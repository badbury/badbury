import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { boolean } from "./boolean.ts";

Deno.test("boolean().make()", () => {
  const type = boolean();

  assertEquals(type.make(true), true);
  assertEquals(type.make(false), false);

  // @ts-expect-error "Invalid make type"
  type.make("hi");
});

Deno.test("boolean().is()", () => {
  const type = boolean();

  assertEquals(type.is(true), true);
  assertEquals(type.is(false), true);

  assertEquals(type.is("hi"), false);
});
