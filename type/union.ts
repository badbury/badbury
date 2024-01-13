import { Constructor, ConstructorToType, parse } from "./_shared.ts";

export type UnionConstructorType<
  D extends Constructor[],
  T extends ConstructorToType<D[number]>,
> = Constructor<T> & {
  name: "UnionConstructor";
  definitions: D;
};
export const union = <
  D extends Constructor[],
  T extends ConstructorToType<D[number]>,
>(
  definitions: D,
): UnionConstructorType<D, T> => {
  return class UnionConstructor {
    static definitions = definitions;
    private constructor() {}
    static make(value: T): T {
      for (const definition of definitions) {
        if (definition.is(value)) {
          return (definition as Constructor<T>).make(value);
        }
      }
      return value;
    }
    static is(subject: T): subject is T {
      return definitions.some((definition) => definition.is(subject));
    }
    static parse(value: unknown): T {
      return parse(value, this);
    }
  } as UnionConstructorType<D, T>;
};
