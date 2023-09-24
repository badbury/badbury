import {
  array,
  boolean,
  Data,
  enums,
  literal,
  nil,
  number,
  record,
  string,
  tag,
  union,
  unknown,
} from "./constructors.ts";
import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { assertInstanceOf } from "https://deno.land/std@0.198.0/assert/assert_instance_of.ts";
import { assertThrows } from "https://deno.land/std@0.198.0/assert/assert_throws.ts";
import { tuple } from "./mod.ts";

/** String */

Deno.test("Data.string().make()", () => {
  const type = Data.string();

  assertEquals(type.make("hi"), "hi");

  // @ts-expect-error "Invalid make type"
  type.make(1234);
});

Deno.test("Data.string().guard()", () => {
  const type = Data.string();

  assertEquals(type.guard("hi"), true);

  assertEquals(type.guard(1234), false);
});

/** Number */

Deno.test("Data.number().make()", () => {
  const type = Data.number();

  assertEquals(type.make(1234), 1234);

  // @ts-expect-error "Invalid make type"
  type.make("hi");
});

Deno.test("Data.number().guard()", () => {
  const type = Data.number();

  assertEquals(type.guard(1234), true);

  assertEquals(type.guard("hi"), false);
});

/** Boolean */

Deno.test("Data.boolean().make()", () => {
  const type = Data.boolean();

  assertEquals(type.make(true), true);
  assertEquals(type.make(false), false);

  // @ts-expect-error "Invalid make type"
  type.make("hi");
});

Deno.test("Data.boolean().guard()", () => {
  const type = Data.boolean();

  assertEquals(type.guard(true), true);
  assertEquals(type.guard(false), true);

  assertEquals(type.guard("hi"), false);
});

/** Null */

Deno.test("Data.null().make()", () => {
  const type = Data.null();

  assertEquals(type.make(null), null);

  // @ts-expect-error "Invalid make type"
  type.make("hi");
});

Deno.test("Data.null().guard()", () => {
  const type = Data.null();

  assertEquals(type.guard(null), true);

  assertEquals(type.guard("hi"), false);
});

/** Literal */

Deno.test('Data.literal("hi").make()', () => {
  const type = Data.literal("hi");

  assertEquals(type.make("hi"), "hi");

  // @ts-expect-error "Invalid make type"
  type.make("hello");
});

Deno.test('Data.literal("hi").guard()', () => {
  const type = Data.literal("hi");

  assertEquals(type.guard("hi"), true);

  assertEquals(type.guard("hello"), false);
  assertEquals(type.guard(1234), false);
});

Deno.test("Data.literal(NaN).make()", () => {
  const type = Data.literal(NaN);

  assertEquals(type.make(NaN), NaN);

  // @ts-expect-error "Invalid make type"
  type.make("NaN");
});

Deno.test("Data.literal(NaN).guard()", () => {
  const type = Data.literal(NaN);

  assertEquals(type.guard(NaN), true);

  assertEquals(type.guard("hello"), false);
  assertEquals(type.guard(1234), false);
});

Deno.test('Data.literal([1, true, "three"]).make()', () => {
  const type = Data.enum([1, true, "three"]);

  assertEquals(type.make(1), 1);
  assertEquals(type.make(true), true);
  assertEquals(type.make("three"), "three");

  // @ts-expect-error "Invalid make type"
  type.make("foo");
  // @ts-expect-error "Invalid make type"
  type.make(2);
  // @ts-expect-error "Invalid make type"
  type.make(false);
});

Deno.test('Data.literal([1, true, "three"]).guard()', () => {
  const type = Data.enum([1, true, "three"]);

  assertEquals(type.guard(1), true);
  assertEquals(type.guard(true), true);
  assertEquals(type.guard("three"), true);

  assertEquals(type.guard("foo"), false);
  assertEquals(type.guard(2), false);
  assertEquals(type.guard(false), false);
});

/** Unknown */

Deno.test("Data.unknown().make()", () => {
  const type = Data.unknown();

  assertEquals(type.make(1234), 1234);
  assertEquals(type.make("hi"), "hi");
  assertEquals(type.make(true), true);
  assertEquals(type.make(null), null);
  assertEquals(type.make({ property: [1234] }), { property: [1234] });
});

Deno.test("Data.unknown().guard()", () => {
  const type = Data.unknown();

  assertEquals(type.guard(1234), true);
  assertEquals(type.guard("hi"), true);
  assertEquals(type.guard(true), true);
  assertEquals(type.guard(null), true);
  assertEquals(type.guard({ property: [1234] }), true);
});

/** Array */

Deno.test("Data.array(Data.string()).make()", () => {
  const type = Data.array(Data.string());

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

Deno.test("Data.array(Data.string()).guard()", () => {
  const type = Data.array(Data.string());

  assertEquals(type.guard("hi"), false);
  assertEquals(type.guard([]), true);
  assertEquals(type.guard(["hi"]), true);
  assertEquals(type.guard(["hi", "hello", "good day"]), true);
  assertEquals(type.guard(["hi", "hello", "good day"]), true);
});

/** Record */

Deno.test("Data.record({ prop: Data.number() }).make()", () => {
  const type = Data.record({ prop: Data.number() });

  assertEquals(type.make({ prop: 1234 }).prop, 1234);
  assertInstanceOf(type.make({ prop: 1234 }), type);

  // @ts-expect-error "Invalid make type"
  type.make({ prop: "1234" });
  // @ts-expect-error "Invalid make type"
  type.make({ prop2: 1234 });
});

Deno.test("new Data.record({ prop: Data.number() }) > .make()", () => {
  const Type = Data.record({ prop: Data.number() });

  assertEquals(new Type({ prop: 1234 }).prop, 1234);
  assertInstanceOf(new Type({ prop: 1234 }), Type);

  // @ts-expect-error "Invalid new type"
  new Type({ prop: "1234" });
  // @ts-expect-error "Invalid new type"
  new Type({ prop2: 1234 });
});

Deno.test("new class Type extends Data.record({ prop: Data.number() }) {} > .make()", () => {
  class Type extends Data.record({ prop: Data.number() }) {}

  assertEquals(new Type({ prop: 1234 }).prop, 1234);
  assertInstanceOf(new Type({ prop: 1234 }), Type);

  // @ts-expect-error "Invalid new type"
  new Type({ prop: "1234" });
  // @ts-expect-error "Invalid new type"
  new Type({ prop2: 1234 });
});

Deno.test("Data.record({ prop: Data.number() }).guard()", () => {
  const type = Data.record({ prop: Data.number() });

  assertEquals(type.guard({ prop: 1234 }), true);
  assertEquals(type.guard({ prop: 0 }), true);
  assertEquals(type.guard({ prop: NaN }), true);
  assertEquals(type.guard({ prop: "hey" }), false);
  assertEquals(type.guard({ prop2: 1234 }), false);
  assertEquals(type.guard([{ prop: 1234 }]), false);
  assertEquals(type.guard({ prop: [1234] }), false);
});

Deno.test("new class Type extends Data.record({ prop: Data.number() }) {} > .guard()", () => {
  class Type extends Data.record({ prop: Data.number() }) {}

  assertEquals(Type.guard({ prop: 1234 }), true);
  assertEquals(Type.guard({ prop: 0 }), true);
  assertEquals(Type.guard({ prop: NaN }), true);
  assertEquals(Type.guard({ prop: "hey" }), false);
  assertEquals(Type.guard({ prop2: 1234 }), false);
  assertEquals(Type.guard([{ prop: 1234 }]), false);
  assertEquals(Type.guard({ prop: [1234] }), false);
});

/** Union */

Deno.test("Data.union([Data.number(), Data.string()]).make()", () => {
  const type = Data.union([Data.number(), Data.string()]);

  assertEquals(type.make(1234), 1234);
  assertEquals(type.make("hi"), "hi");
  // @ts-expect-error "Invalid make type"
  type.make(true);
  // @ts-expect-error "Invalid make type"
  type.make([1234]);
});

Deno.test("Data.union([Data.number(), Data.string()]).guard()", () => {
  const type = Data.union([Data.number(), Data.string()]);

  assertEquals(type.guard(1234), true);
  assertEquals(type.guard("hi"), true);
  assertEquals(type.guard(true), false);
  assertEquals(type.guard([1234]), false);
});

Deno.test("Data.union([RecordOne, RecordTwo]).make()", () => {
  class RecordOne extends Data.record({
    propOne: Data.string(),
  }) {}
  class RecordTwo extends Data.record({
    propTwo: Data.number(),
  }) {}
  const type = Data.union([RecordOne, RecordTwo]);

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

Deno.test("Data.union([RecordOne, RecordTwo]).guard()", () => {
  class RecordOne extends Data.record({
    propOne: Data.string(),
  }) {}
  class RecordTwo extends Data.record({
    propTwo: Data.number(),
  }) {}
  const type = Data.union([RecordOne, RecordTwo]);

  assertEquals(type.guard({ propOne: "hi" }), true);
  assertEquals(type.guard({ propTwo: 1234 }), true);

  assertEquals(type.guard({ propOne: 1234 }), false);
  assertEquals(type.guard({ propTwo: "hi" }), false);
  assertEquals(type.guard(true), false);
  assertEquals(type.guard({}), false);
});

Deno.test("Data.union([RecordOne, RecordTwo]).parse()", () => {
  class RecordOne extends Data.record({
    propOne: Data.string(),
  }) {}
  class RecordTwo extends Data.record({
    propTwo: Data.number(),
  }) {}
  const type = Data.union([RecordOne, RecordTwo]);
  const instanceOne = type.make({ propOne: "hi" });
  const instanceTwo = type.make({ propTwo: 1234 });

  assertInstanceOf(instanceOne, RecordOne);
  assertInstanceOf(instanceTwo, RecordTwo);
  assertInstanceOf(RecordOne.parse(instanceOne), RecordOne);
  assertInstanceOf(RecordTwo.parse(instanceTwo), RecordTwo);
  assertThrows(() => RecordOne.parse(instanceTwo), Error, "Can not parse");
  assertThrows(() => RecordTwo.parse(instanceOne), Error, "Can not parse");
});

/** Tuple */

Deno.test("Data.tuple([Data.number(), Data.string()]).make()", () => {
  const type = tuple([Data.number(), Data.string()]);

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

Deno.test("Data.tuple([Data.number(), Data.string()]).guard()", () => {
  const type = Data.tuple([Data.number(), Data.string()]);

  assertEquals(type.guard([1234, "hi"]), true);
  assertEquals(type.guard(true), false);
  assertEquals(type.guard([1234]), false);
  assertEquals(type.guard([]), false);
  assertEquals(type.guard(["hi", 1234]), false);
  assertEquals(type.guard([1234, "hi", 5678]), false);
});

/** Tag */

Deno.test("Data.tag({ One: string(), Two: nil() }).make()", () => {
  const type = Data.tag({ One: Data.string(), Two: Data.null() });

  assertEquals(type.make({ One: "hey" }), { One: "hey" });
  assertEquals(type.make({ Two: null }), { Two: null });

  // @ts-expect-error "Invalid make type"
  type.make("hey");
  // @ts-expect-error "Invalid make type"
  type.make(null);
  // @ts-expect-error "Invalid make type"
  type.make([]);
  // @ts-expect-error "Invalid make type"
  type.make({ foo: 123 });
  // @ts-expect-error "Invalid make type"
  type.make({ One: null });
  // @ts-expect-error "Invalid make type"
  type.make({ Two: "hey" });
});

Deno.test("Data.tag({ One: string(), Two: nil() }).guard()", () => {
  const type = Data.tag({ One: Data.string(), Two: Data.null() });

  assertEquals(type.guard({ One: "hey" }), true);
  assertEquals(type.guard({ Two: null }), true);
  assertEquals(type.guard("hey"), false);
  assertEquals(type.guard(null), false);
  assertEquals(type.guard([]), false);
  assertEquals(type.guard({ foo: 123 }), false);
  assertEquals(type.guard({ One: null }), false);
  assertEquals(type.guard({ Two: "hey" }), false);
});

/** Combos */

export class MyClass extends record({
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
    record({ prop1: string() }),
    record({ prop2: number() }),
    boolean(),
  ]),
  tag: tag({
    result: number(),
    error: string(),
  }),
  arrayOfUnion: array(union([string(), boolean()])),
  tupleWithUnion: tuple([union([string(), boolean()]), number()]),
  object: record({
    prop: string(),
    nestedObject: record({
      nestedProp: number(),
    }),
  }),
}) {}

Deno.test("Use large records as a constructor", () => {
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
