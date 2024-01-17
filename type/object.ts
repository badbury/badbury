import { Constructor, ObjectOfConstructorsToTypes, parse } from "./_shared.ts";

export interface ObjectConstructor<
  T extends ObjectOfConstructorsToTypes<D>,
  D extends Record<string, Constructor>,
> extends Constructor<T> {
  name: "Object";
  definitions: D;
  new (values: T): T;
  prototype: T;
}
export const object = <
  T extends ObjectOfConstructorsToTypes<D>,
  D extends Record<string, Constructor>,
>(
  definitions: D = {} as D,
): ObjectConstructor<T, D> => {
  const properties = Object.keys(definitions) as (keyof T)[];
  return class BadburyObject {
    static definitions = definitions;
    constructor(values: T) {
      for (const key of properties) {
        (this as unknown as T)[key] = values[key];
      }
    }
    static make(values: T) {
      return new this(values);
    }
    static is(values: unknown): values is T {
      if (
        values === null || typeof values !== "object" || values instanceof Array
      ) {
        return false;
      }
      for (const key of properties) {
        if (values !== null && !(key in values)) {
          return false;
        }
        if (!definitions[key as keyof D].is((values as T)[key])) {
          return false;
        }
      }
      return true;
    }
    static parse(value: unknown): T {
      return parse(value, this as ObjectConstructor<T, D>);
    }
  } as ObjectConstructor<T, D>;
};
