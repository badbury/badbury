import { array, boolean, number, object, string, union } from "./mod.ts";
import { match } from "./match.ts";
import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";

Deno.test("match(union([ObjectOne, ObjectTwo]))", () => {
  class ObjectOne extends object({
    propOne: string(),
  }) {}
  class ObjectTwo extends object({
    propTwo: number(),
  }) {}
  const ObjectThree = object({
    propThree: array(string()),
  });
  const Bool = boolean();
  const type = union([ObjectOne, ObjectTwo, ObjectThree, Bool]);
  const instanceOne = type.make({ propOne: "hi" });
  const instanceTwo = type.make({ propTwo: 1234 });
  const instanceThree = type.make({ propThree: ["a", "b", "c"] });
  const instanceFour = type.make(false);

  function getString(
    instance:
      | ObjectOne
      | ObjectTwo
      | ReturnType<typeof ObjectThree["make"]>
      | ReturnType<typeof Bool["make"]>,
  ) {
    return match(instance)
      .with(ObjectOne, (value) => value.propOne)
      .with(ObjectTwo, (value) => String(value.propTwo))
      .with(ObjectThree, (value) => value.propThree.join(","))
      .with(Bool, (value) => (value ? "true" : "false"))
      .run();
  }

  assertEquals(getString(instanceOne), "hi");
  assertEquals(getString(instanceTwo), "1234");
  assertEquals(getString(instanceThree), "a,b,c");
  assertEquals(getString(instanceFour), "false");

  assertEquals(getString({ propOne: "hi" }), "hi");
  assertEquals(getString({ propTwo: 1234 }), "1234");
  assertEquals(getString({ propThree: ["a", "b", "c"] }), "a,b,c");
  assertEquals(getString(false), "false");
});

Deno.test("match with default", () => {
  class ObjectOne extends object({
    propOne: string(),
  }) {}
  class ObjectTwo extends object({
    propTwo: number(),
  }) {}
  const ObjectThree = object({
    propThree: array(string()),
  });
  const Bool = boolean();
  const type = union([ObjectOne, ObjectTwo, ObjectThree, Bool]);
  const instanceOne = type.make({ propOne: "hi" });
  const instanceTwo = type.make({ propTwo: 1234 });
  const instanceThree = type.make({ propThree: ["a", "b", "c"] });
  const instanceFour = type.make(false);

  const getString = (
    instance:
      | ObjectOne
      | ObjectTwo
      | ReturnType<typeof ObjectThree["make"]>
      | ReturnType<typeof Bool["make"]>,
  ) =>
    match(instance)
      .with(ObjectOne, (value) => value.propOne)
      .with(ObjectTwo, (value) => String(value.propTwo))
      .default((value) => JSON.stringify(value))
      .run();

  assertEquals(getString(instanceOne), "hi");
  assertEquals(getString(instanceTwo), "1234");
  assertEquals(getString(instanceThree), '{"propThree":["a","b","c"]}');
  assertEquals(getString(instanceFour), "false");

  assertEquals(getString({ propOne: "hi" }), "hi");
  assertEquals(getString({ propTwo: 1234 }), "1234");
  assertEquals(
    getString({ propThree: ["a", "b", "c"] }),
    '{"propThree":["a","b","c"]}',
  );
  assertEquals(getString(false), "false");
});

// Deno.test("match with tag", () => {
//   const MyTag = Data.tag({
//     One: Data.string(),
//     Two: Data.object({ foo: Data.number() }),
//   });

//   const greeting = match({ "One": "234" })
//     .with(MyTag.One, (value) => "Hello, " + value)
//     .with(
//       MyTag.Two,
//       (value) => "Hello, " + String(value.foo) + " year old person",
//     )
//     .run();

//   assertEquals(greeting, "Hello, 234 year old person");
// });
