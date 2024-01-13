import { Constructor, Identity, LiteralTypes, parse } from "./_shared.ts";

export type LiteralConstructorType<T extends LiteralTypes> = Constructor<T> & {
  name: "LiteralConstructor";
  value: T;
};
export const literal = <T extends LiteralTypes>(
  value: T,
): LiteralConstructorType<T> => {
  return class LiteralConstructor {
    static value = value;
    private constructor() {}
    static make(value: Identity<T>): T {
      return value;
    }
    static is(subject: T): subject is T {
      if (typeof value === "number" && Number.isNaN(value)) {
        return typeof subject === "number" && Number.isNaN(subject);
      }
      return value === subject;
    }
    static parse(value: unknown): T {
      return parse(value, this as LiteralConstructorType<T>);
    }
  } as LiteralConstructorType<T>;
};
