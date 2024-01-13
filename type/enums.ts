import { Constructor, Identity, LiteralTypes, parse } from "./_shared.ts";

export type EnumConstructorType<T extends LiteralTypes, A extends T[]> =
  & Constructor<A[number]>
  & {
    name: "EnumConstructor";
    values: A;
  };
export const enums = <T extends LiteralTypes, A extends T[]>(
  values: A,
): EnumConstructorType<T, A> => {
  return class EnumConstructor {
    static values = values;
    private constructor() {}
    static make(value: Identity<A[number]>): A[number] {
      return value;
    }
    static is(subject: A[number]): subject is A[number] {
      if (typeof subject === "number" && Number.isNaN(subject)) {
        return values.some(Number.isNaN);
      }
      return values.includes(subject);
    }
    static parse(value: unknown): A[number] {
      return parse(value, this);
    }
  } as EnumConstructorType<T, A>;
};
