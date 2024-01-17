import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { tag } from "./tag.ts";
import { string } from "./string.ts";
import { nil } from "./nil.ts";

Deno.test("tag({ One: string(), Two: nil() }).make()", () => {
  const type = tag({ One: string(), Two: nil() });

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

Deno.test("tag({ One: string(), Two: nil() }).is()", () => {
  const type = tag({ One: string(), Two: nil() });

  assertEquals(type.is({ One: "hey" }), true);
  assertEquals(type.is({ Two: null }), true);
  assertEquals(type.is("hey"), false);
  assertEquals(type.is(null), false);
  assertEquals(type.is([]), false);
  assertEquals(type.is({ foo: 123 }), false);
  assertEquals(type.is({ One: null }), false);
  assertEquals(type.is({ Two: "hey" }), false);
});
