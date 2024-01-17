import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { string } from "./string.ts";

Deno.test("string().make()", () => {
  const type = string();

  assertEquals(type.make("hi"), "hi");

  // @ts-expect-error "Invalid make type"
  type.make(1234);
});

Deno.test("string().is()", () => {
  const type = string();

  assertEquals(type.is("hi"), true);

  assertEquals(type.is(1234), false);
});
