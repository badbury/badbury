import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { literal } from "./literal.ts";

Deno.test('literal("hi").make()', () => {
  const type = literal("hi");

  assertEquals(type.make("hi"), "hi");

  // @ts-expect-error "Invalid make type"
  type.make("hello");
});

Deno.test('literal("hi").is()', () => {
  const type = literal("hi");

  assertEquals(type.is("hi"), true);

  assertEquals(type.is("hello"), false);
  assertEquals(type.is(1234), false);
});

Deno.test("literal(NaN).make()", () => {
  const type = literal(NaN);

  assertEquals(type.make(NaN), NaN);

  // @ts-expect-error "Invalid make type"
  type.make("NaN");
});

Deno.test("literal(NaN).is()", () => {
  const type = literal(NaN);

  assertEquals(type.is(NaN), true);

  assertEquals(type.is("hello"), false);
  assertEquals(type.is(1234), false);
});
