import { Constructor, ConstructorToType, parse } from "./_shared.ts";

export interface ArrayConstructor<
  D extends Constructor,
  T extends ConstructorToType<D>,
> extends Constructor<T[]> {
  name: "ArrayConstructor";
  definitions: D;
}
export const array = <D extends Constructor, T extends ConstructorToType<D>>(
  definitions: D,
): ArrayConstructor<D, T> => {
  return class BadburyArray {
    static definitions = definitions;
    declare static foo: string;
    static make(values: T[]) {
      return values;
    }
    static is(values: unknown): values is T[] {
      return Array.isArray(values) && values.every(definitions.is);
    }
    static parse(value: unknown): T[] {
      return parse(value, this);
    }
  } as ArrayConstructor<D, T>;
};
