// import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import {
  array,
  boolean,
  enums,
  literal,
  nil,
  number,
  record,
  string,
  tuple,
  union,
  unknown,
} from "./mod.ts";

const testData = {
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
  arrayOfUnion: ["1", true, false, "2"],
  object: {
    prop: "13",
    nestedObject: { nestedProp: 2 },
  },
} as unknown;

class BadburyType extends record({
  string: string(),
  number: number(),
  unknown: unknown(),
  boolean: boolean(),
  null: nil(),
  literal: literal("steve"),
  enum: enums(["1", "true", "three"]),
  tuple: tuple([boolean(), string()]),
  array: array(string()),
  union: union([
    record({ prop1: string() }),
    record({ prop2: number() }),
    boolean(),
  ]),
  arrayOfUnion: array(union([string(), boolean()])),
  object: record({
    prop: string(),
    nestedObject: record({
      nestedProp: number(),
    }),
  }),
}) {}

import { z } from "https://deno.land/x/zod@v3.22.1/mod.ts";

const ZodType = z.object({
  string: z.string(),
  number: z.number(),
  unknown: z.unknown(),
  boolean: z.boolean(),
  null: z.null(),
  literal: z.literal("steve"),
  enum: z.enum(["1", "true", "three"]),
  tuple: z.tuple([z.boolean(), z.string()]),
  array: z.array(z.string()),
  union: z.union([
    z.object({ prop1: z.string() }),
    z.object({ prop2: z.number() }),
    z.boolean(),
  ]),
  arrayOfUnion: z.array(z.union([z.string(), z.boolean()])),
  object: z.object({
    prop: z.string(),
    nestedObject: z.object({
      nestedProp: z.number(),
    }),
  }),
});

import myz from "npm:myzod";

const MyZodType = myz.object({
  string: myz.string(),
  number: myz.number(),
  unknown: myz.unknown(),
  boolean: myz.boolean(),
  null: myz.null(),
  literal: myz.literal("steve"),
  enum: myz.enum(["1", "true", "three"]),
  tuple: myz.tuple([myz.boolean(), myz.string()]),
  array: myz.array(myz.string()),
  union: myz.union([
    myz.object({ prop1: myz.string() }),
    myz.object({ prop2: myz.number() }),
    myz.boolean(),
  ]),
  arrayOfUnion: myz.array(myz.union([myz.string(), myz.boolean()])),
  object: myz.object({
    prop: myz.string(),
    nestedObject: myz.object({
      nestedProp: myz.number(),
    }),
  }),
});

import * as valibot from "https://deno.land/x/valibot@v0.15.0/mod.ts";

const MyValibotType = valibot.object({
  string: valibot.string(),
  number: valibot.number(),
  unknown: valibot.unknown(),
  boolean: valibot.boolean(),
  null: valibot.nullType(),
  literal: valibot.literal("steve"),
  enum: valibot.enumType(["1", "true", "three"]),
  tuple: valibot.tuple([valibot.boolean(), valibot.string()]),
  array: valibot.array(valibot.string()),
  union: valibot.union([
    valibot.object({ prop1: valibot.string() }),
    valibot.object({ prop2: valibot.number() }),
    valibot.boolean(),
  ]),
  arrayOfUnion: valibot.array(
    valibot.union([valibot.string(), valibot.boolean()]),
  ),
  object: valibot.object({
    prop: valibot.string(),
    nestedObject: valibot.object({
      nestedProp: valibot.number(),
    }),
  }),
});

import * as s from "npm:superstruct";

const SuperstructType = s.object({
  string: s.string(),
  number: s.number(),
  unknown: s.unknown(),
  boolean: s.boolean(),
  null: s.nullable(s.string()),
  literal: s.literal("steve"),
  enum: s.enums(["1", "true", "three"]),
  tuple: s.tuple([s.boolean(), s.string()]),
  array: s.array(s.string()),
  union: s.union([
    s.object({ prop1: s.string() }),
    s.object({ prop2: s.number() }),
    s.boolean(),
  ]),
  arrayOfUnion: s.array(s.union([s.string(), s.boolean()])),
  object: s.object({
    prop: s.string(),
    nestedObject: s.object({
      nestedProp: s.number(),
    }),
  }),
});

import { Type } from "npm:@sinclair/typebox";
import { TypeCompiler } from "npm:@sinclair/typebox/compiler";
import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";

const TypeboxType = TypeCompiler.Compile(Type.Object({
  string: Type.String(),
  number: Type.Number(),
  unknown: Type.Unknown(),
  boolean: Type.Boolean(),
  null: Type.Null(),
  literal: Type.Literal("steve"),
  enum: Type.Union([
    Type.Literal("1"),
    Type.Literal("true"),
    Type.Literal("three"),
  ]),
  tuple: Type.Tuple([Type.Boolean(), Type.String()]),
  array: Type.Array(Type.String()),
  union: Type.Union([
    Type.Object({ prop1: Type.String() }),
    Type.Object({ prop2: Type.Number() }),
    Type.Boolean(),
  ]),
  arrayOfUnion: Type.Array(Type.Union([Type.String(), Type.Boolean()])),
  object: Type.Object({
    prop: Type.String(),
    nestedObject: Type.Object({
      nestedProp: Type.Number(),
    }),
  }),
}));

Deno.bench("BadburyType parse", () => {
  BadburyType.parse(testData);
});
Deno.bench("ZodType parse", () => {
  ZodType.parse(testData);
});
Deno.bench("MyZodType parse", () => {
  MyZodType.parse(testData);
});
Deno.bench("MyValibotType parse", () => {
  valibot.parse(MyValibotType, testData);
});
Deno.bench("SuperstructType parse", () => {
  s.create(testData, SuperstructType);
});

Deno.bench("BadburyType check", () => {
  assertEquals(BadburyType.is(testData), true);
});
Deno.bench("MyValibotType check", () => {
  assertEquals(valibot.is(MyValibotType, testData), true);
});
Deno.bench("SuperstructType check", () => {
  assertEquals(s.is(testData, SuperstructType), true);
});
Deno.bench("TypeboxType check", () => {
  assertEquals(TypeboxType.Check(testData), true);
});
