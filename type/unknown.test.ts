import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { unknown } from "./unknown.ts";

Deno.test("unknown().make()", () => {
  const type = unknown();

  assertEquals(type.make(1234), 1234);
  assertEquals(type.make("hi"), "hi");
  assertEquals(type.make(true), true);
  assertEquals(type.make(null), null);
  assertEquals(type.make({ property: [1234] }), { property: [1234] });
});

Deno.test("unknown().is()", () => {
  const type = unknown();

  assertEquals(type.is(1234), true);
  assertEquals(type.is("hi"), true);
  assertEquals(type.is(true), true);
  assertEquals(type.is(null), true);
  assertEquals(type.is({ property: [1234] }), true);
});
