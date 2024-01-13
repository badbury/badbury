import {
  Constructor,
  ConstructorRecordToType,
  Flatten,
  parse,
} from "./_shared.ts";

type UnionOfSingleKeyObjects<T extends object> = {
  [K in keyof T]: { [P in K]: T[P] };
}[keyof T];
type k = UnionOfSingleKeyObjects<{ foo: 123; bar: 456 }>;
export type TagConstructor<
  T extends Flatten<UnionOfSingleKeyObjects<ConstructorRecordToType<D>>>,
  D extends Record<string, Constructor>,
> = Constructor<T> & D & {
  name: string;
  definitions: D;
  new (values: T): T;
  prototype: T;
};
export const tag = <
  T extends Flatten<UnionOfSingleKeyObjects<ConstructorRecordToType<D>>>,
  D extends Record<string, Constructor>,
>(
  definitions: D = {} as D,
): TagConstructor<T, D> => {
  const properties = Object.keys(definitions) as (keyof T)[];
  const Tag = class Tag {
    static definitions = definitions;
    constructor(values: T) {
      for (const key of properties) {
        if (Object.hasOwn(values, key)) {
          (this as unknown as T)[key] = values[key];
          continue;
        }
      }
    }
    static make(values: T) {
      return values;
    }
    static is(values: unknown): values is T {
      if (
        values === null || typeof values !== "object" || values instanceof Array
      ) {
        return false;
      }
      for (const key of properties) {
        if (
          key in values &&
          definitions[key as keyof D].is((values as T)[key])
        ) {
          return true;
        }
      }
      return false;
    }
    static parse(value: unknown): T {
      return parse(value, this as TagConstructor<T, D>);
    }
  } as TagConstructor<T, D>;
  Object.assign(Tag, definitions);
  return Tag;
};
