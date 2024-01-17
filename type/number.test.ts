import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { number } from "./number.ts";

Deno.test("number().make()", () => {
  const type = number();

  assertEquals(type.make(1234), 1234);

  // @ts-expect-error "Invalid make type"
  type.make("hi");
});

Deno.test("number().is()", () => {
  const type = number();

  assertEquals(type.is(1234), true);

  assertEquals(type.is("hi"), false);
});
