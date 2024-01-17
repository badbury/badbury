import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import {
  array,
  boolean,
  enums,
  literal,
  nil,
  number,
  object,
  string,
  tag,
  tuple,
  union,
  unknown,
} from "./mod.ts";

export class MyClass extends object({
  string: string(),
  number: number(),
  unknown: unknown(),
  boolean: boolean(),
  null: nil(),
  literal: literal("steve"),
  enum: enums([1, true, "three"]),
  tuple: tuple([boolean(), string()]),
  array: array(string()),
  union: union([
    object({ prop1: string() }),
    object({ prop2: number() }),
    boolean(),
  ]),
  tag: tag({
    result: number(),
    error: string(),
  }),
  arrayOfUnion: array(union([string(), boolean()])),
  tupleWithUnion: tuple([union([string(), boolean()]), number()]),
  object: object({
    prop: string(),
    nestedObject: object({
      nestedProp: number(),
    }),
  }),
}) {}

Deno.test("Use large object as a constructor", () => {
  const myData = new MyClass({
    string: "123",
    number: 123,
    unknown: true,
    boolean: false,
    null: null,
    literal: "steve",
    enum: "three",
    tuple: [true, "hey"],
    array: ["1", "1", "1"],
    union: { prop1: "hello" },
    tag: { error: "could not parse" },
    arrayOfUnion: ["1", true, false, "2"],
    tupleWithUnion: [false, 1],
    object: {
      prop: "13",
      nestedObject: { nestedProp: 2 },
    },
  });

  assertEquals(myData.union, { prop1: "hello" });
  assertEquals(myData.object.nestedObject.nestedProp, 2);
  assertEquals(myData.null, null);
});

Deno.test("Use large records as a type argument", () => {
  const pojoInstance = {
    string: "123",
    number: 123,
    unknown: true,
    boolean: false,
    null: null,
    literal: "steve" as const,
    enum: true as const,
    tuple: [false, "bye"] as [boolean, string],
    array: ["1"],
    union: { prop2: 1234 },
    tag: { result: 1 },
    arrayOfUnion: ["1", true],
    tupleWithUnion: ["hey", 3] as [string, number],
    object: {
      prop: "13",
      nestedObject: { nestedProp: 2 },
    },
  };
  const classInstance = new MyClass(pojoInstance);

  function getNestedProp(foo: MyClass) {
    return foo.object.nestedObject.nestedProp;
  }

  assertEquals(getNestedProp(pojoInstance), 2);
  assertEquals(getNestedProp(classInstance), 2);
});
