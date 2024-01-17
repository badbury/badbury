import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { union } from "./union.ts";
import { number } from "./number.ts";
import { string } from "./string.ts";
import { object } from "./object.ts";
import { assertInstanceOf } from "https://deno.land/std@0.198.0/assert/assert_instance_of.ts";
import { assertThrows } from "https://deno.land/std@0.198.0/assert/assert_throws.ts";

Deno.test("union([number(), string()]).make()", () => {
  const type = union([number(), string()]);

  assertEquals(type.make(1234), 1234);
  assertEquals(type.make("hi"), "hi");
  // @ts-expect-error "Invalid make type"
  type.make(true);
  // @ts-expect-error "Invalid make type"
  type.make([1234]);
});

Deno.test("union([number(), string()]).is()", () => {
  const type = union([number(), string()]);

  assertEquals(type.is(1234), true);
  assertEquals(type.is("hi"), true);
  assertEquals(type.is(true), false);
  assertEquals(type.is([1234]), false);
});

Deno.test("union([RecordOne, RecordTwo]).make()", () => {
  class RecordOne extends object({
    propOne: string(),
  }) {}
  class RecordTwo extends object({
    propTwo: number(),
  }) {}
  const type = union([RecordOne, RecordTwo]);

  assertEquals((type.make({ propOne: "hi" }) as RecordOne).propOne, "hi");
  assertInstanceOf(type.make({ propOne: "hi" }), RecordOne);
  assertEquals((type.make({ propTwo: 1234 }) as RecordTwo).propTwo, 1234);
  assertInstanceOf(type.make({ propTwo: 1234 }), RecordTwo);

  // @ts-expect-error "Invalid make type"
  type.make({ propOne: 1234 });
  // @ts-expect-error "Invalid make type"
  type.make({ propTwo: "hi" });
  // @ts-expect-error "Invalid make type"
  type.make(true);
  // @ts-expect-error "Invalid make type"
  type.make({});
});

Deno.test("union([RecordOne, RecordTwo]).is()", () => {
  class RecordOne extends object({
    propOne: string(),
  }) {}
  class RecordTwo extends object({
    propTwo: number(),
  }) {}
  const type = union([RecordOne, RecordTwo]);

  assertEquals(type.is({ propOne: "hi" }), true);
  assertEquals(type.is({ propTwo: 1234 }), true);

  assertEquals(type.is({ propOne: 1234 }), false);
  assertEquals(type.is({ propTwo: "hi" }), false);
  assertEquals(type.is(true), false);
  assertEquals(type.is({}), false);
});

Deno.test("union([RecordOne, RecordTwo]).parse()", () => {
  class RecordOne extends object({
    propOne: string(),
  }) {}
  class RecordTwo extends object({
    propTwo: number(),
  }) {}
  const type = union([RecordOne, RecordTwo]);
  const instanceOne = type.make({ propOne: "hi" });
  const instanceTwo = type.make({ propTwo: 1234 });

  assertInstanceOf(instanceOne, RecordOne);
  assertInstanceOf(instanceTwo, RecordTwo);
  assertInstanceOf(RecordOne.parse(instanceOne), RecordOne);
  assertInstanceOf(RecordTwo.parse(instanceTwo), RecordTwo);
  assertThrows(() => RecordOne.parse(instanceTwo), Error, "Can not parse");
  assertThrows(() => RecordTwo.parse(instanceOne), Error, "Can not parse");
});
