import { Constructor, ConstructorTupleToType, parse } from "./_shared.ts";

export interface TupleConstructor<
  D extends Constructor[],
  T extends ConstructorTupleToType<D>,
> extends Constructor<T> {
  name: "Record";
  definitions: D;
}
export const tuple = <
  D extends Constructor[],
  T extends ConstructorTupleToType<D>,
>(
  definitions: [...D],
): TupleConstructor<D, T> => {
  return class Tuple {
    static definitions = definitions;
    static make(values: T) {
      return values;
    }
    static is(values: unknown): values is T {
      if (!Array.isArray(values) || values.length !== definitions.length) {
        return false;
      }
      for (const [index, definition] of definitions.entries()) {
        if (!definition.is(values[index])) {
          return false;
        }
      }
      return true;
    }
    static parse(value: unknown): T {
      return parse(value, this);
    }
  } as TupleConstructor<D, T>;
};
