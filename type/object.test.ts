import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { assertInstanceOf } from "https://deno.land/std@0.198.0/assert/assert_instance_of.ts";
import { object } from "./object.ts";
import { number } from "./number.ts";

Deno.test("object({ prop: number() }).make()", () => {
  const type = object({ prop: number() });

  assertEquals(type.make({ prop: 1234 }).prop, 1234);
  assertInstanceOf(type.make({ prop: 1234 }), type);

  // @ts-expect-error "Invalid make type"
  type.make({ prop: "1234" });
  // @ts-expect-error "Invalid make type"
  type.make({ prop2: 1234 });
});

Deno.test("new object({ prop: number() })", () => {
  const Type = object({ prop: number() });

  assertEquals(new Type({ prop: 1234 }).prop, 1234);
  assertInstanceOf(new Type({ prop: 1234 }), Type);

  // @ts-expect-error "Invalid new type"
  new Type({ prop: "1234" });
  // @ts-expect-error "Invalid new type"
  new Type({ prop2: 1234 });
});

Deno.test("new class extends object({ prop: number() }) {}", () => {
  class Type extends object({ prop: number() }) {}

  assertEquals(new Type({ prop: 1234 }).prop, 1234);
  assertInstanceOf(new Type({ prop: 1234 }), Type);

  // @ts-expect-error "Invalid new type"
  new Type({ prop: "1234" });
  // @ts-expect-error "Invalid new type"
  new Type({ prop2: 1234 });
});

Deno.test("object({ prop: number() }).is()", () => {
  const type = object({ prop: number() });

  assertEquals(type.is({ prop: 1234 }), true);
  assertEquals(type.is({ prop: 0 }), true);
  assertEquals(type.is({ prop: NaN }), true);
  assertEquals(type.is({ prop: "hey" }), false);
  assertEquals(type.is({ prop2: 1234 }), false);
  assertEquals(type.is([{ prop: 1234 }]), false);
  assertEquals(type.is({ prop: [1234] }), false);
});

Deno.test("(class extends object({ prop: number() }) {}).is()", () => {
  class Type extends object({ prop: number() }) {}

  assertEquals(Type.is({ prop: 1234 }), true);
  assertEquals(Type.is({ prop: 0 }), true);
  assertEquals(Type.is({ prop: NaN }), true);
  assertEquals(Type.is({ prop: "hey" }), false);
  assertEquals(Type.is({ prop2: 1234 }), false);
  assertEquals(Type.is([{ prop: 1234 }]), false);
  assertEquals(Type.is({ prop: [1234] }), false);
});
