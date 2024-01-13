import {
  Constructor,
  ObjectOfConstructorsToTypes,
  parse,
} from "./_shared.ts";

export interface RecordConstructor<
  T extends ObjectOfConstructorsToTypes<D>,
  D extends Record<string, Constructor>,
> extends Constructor<T> {
  name: "Record";
  definitions: D;
  new (values: T): T;
  prototype: T;
}
export const record = <
  T extends ObjectOfConstructorsToTypes<D>,
  D extends Record<string, Constructor>,
>(
  definitions: D = {} as D,
): RecordConstructor<T, D> => {
  const properties = Object.keys(definitions) as (keyof T)[];
  return class Record {
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
      return parse(value, this as RecordConstructor<T, D>);
    }
  } as RecordConstructor<T, D>;
};
