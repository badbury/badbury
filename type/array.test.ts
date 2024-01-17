import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { array } from "./array.ts";
import { string } from "./string.ts";

Deno.test("array(string()).make()", () => {
  const type = array(string());

  assertEquals(type.make([]), []);
  assertEquals(type.make(["hi"]), ["hi"]);
  assertEquals(type.make(["hi", "hello", "good day"]), [
    "hi",
    "hello",
    "good day",
  ]);

  // @ts-expect-error "Invalid make type"
  type.make([123]);
});

Deno.test("array(string()).is()", () => {
  const type = array(string());

  assertEquals(type.is("hi"), false);
  assertEquals(type.is([]), true);
  assertEquals(type.is(["hi"]), true);
  assertEquals(type.is(["hi", "hello", "good day"]), true);
  assertEquals(type.is(["hi", "hello", "good day"]), true);
});
