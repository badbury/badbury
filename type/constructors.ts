export type Identity<T> = T;
type Flatten<T extends object> = Identity<{ [k in keyof T]: T[k] }>;

export type Constructor<T = unknown> = {
  make(t: T): T;
  guard(subject: unknown): subject is T;
  parse(subject: unknown): T;
  name: string;
};

export type ObjectOfConstructorsToTypes<
  T extends { [key: string]: Constructor },
> = Flatten<
  {
    [key in keyof T]: ReturnType<T[key]["make"]>;
  }
>;

export type ConstructorToType<T extends Constructor> = ReturnType<T["make"]>;
export type ConstructorsToType<
  T extends (Constructor[] | Readonly<Constructor[]>),
> = {
  [K in keyof T]: ConstructorToType<T[K]>;
};

export function parse<T>(value: unknown, constructor: Constructor<T>): T {
  if (typeof constructor === "function" && value instanceof constructor) {
    return value as T;
  }
  if (constructor.guard(value)) {
    return constructor.make(value);
  }
  throw new Error(`Can not parse ${value} into a ${constructor.name}`);
}

export class StringConstructor extends String {
  static make(value: string): string {
    return value;
  }
  static guard(value: unknown): value is string {
    return typeof value === "string";
  }
  static parse(value: unknown): string {
    return parse(value, this);
  }
}
export const string = () => StringConstructor;

export class NumberConstructor extends Number {
  static make(value: number): number {
    return value;
  }
  static guard(value: unknown): value is number {
    return typeof value === "number";
  }
  static parse(value: unknown): number {
    return parse(value, this);
  }
}
export const number = () => NumberConstructor;

export class BooleanConstructor extends Boolean {
  static make(value: boolean): boolean {
    return value;
  }
  static guard(value: unknown): value is boolean {
    return typeof value === "boolean";
  }
  static parse(value: unknown): boolean {
    return parse(value, this);
  }
}
export const boolean = () => BooleanConstructor;

export class NullConstructor {
  static make(value: null): null {
    return value;
  }
  static guard(value: unknown): value is null {
    return value === null;
  }
  static parse(value: unknown): null {
    return parse(value, this);
  }
}
export const nil = () => NullConstructor;

export class UnknownConstructor {
  static make(value: unknown): unknown {
    return value;
  }
  static guard(_: unknown): _ is unknown {
    return true;
  }
  static parse(value: unknown): unknown {
    return parse(value, this);
  }
}
export const unknown = () => UnknownConstructor;

export interface ArrayConstructor<
  D extends Constructor,
  T extends ConstructorToType<D>,
> extends Constructor<T[]>, Array<T> {
  name: string;
  definitions: D;
  (values: T[]): T[];
  new (values: T[]): T[];
}
export const array = <D extends Constructor, T extends ConstructorToType<D>>(
  definitions: D,
): ArrayConstructor<D, T> => {
  const TypedArray = function (this: typeof TypedArray, values: T[]) {
    if (!(this instanceof TypedArray)) {
      return new TypedArray(values);
    }
    if (this.guard(values)) {
      this.push(...values);
    }
  } as ArrayConstructor<D, T>;
  TypedArray.definitions = definitions;
  TypedArray.make = function (values: T[]) {
    return values;
  };
  TypedArray.guard = function (values: unknown): values is T[] {
    return Array.isArray(values) && values.every(definitions.guard);
  };
  TypedArray.parse = function (value: unknown): T[] {
    return parse(value, this);
  };
  return TypedArray;
};

export interface RecordConstructor<
  D extends Record<string, Constructor>,
  T extends ObjectOfConstructorsToTypes<D>,
> extends Constructor<T> {
  name: string;
  definitions: D;
  (values: T): T;
  new (values: T): T;
  prototype: T;
}
export const record = <
  D extends Record<string, Constructor>,
  T extends ObjectOfConstructorsToTypes<D>,
>(
  definitions: D = {} as D,
): RecordConstructor<D, T> => {
  const properties = Object.keys(definitions) as (keyof T)[];
  const Record = function (this: unknown, values: T) {
    if (!(this instanceof Record)) {
      return new Record(values);
    }
    for (const key of properties) {
      this[key] = values[key];
    }
  } as RecordConstructor<D, T>;
  Record.definitions = definitions;
  Record.make = function (values: T) {
    return new this(values);
  };
  Record.guard = function (values: unknown): values is T {
    if (
      values === null || typeof values !== "object" || values instanceof Array
    ) {
      return false;
    }
    for (const key of properties) {
      if (values !== null && !(key in values)) {
        return false;
      }
      if (!definitions[key as keyof D].guard((values as T)[key])) {
        return false;
      }
    }
    return true;
  };
  Record.parse = function (value: unknown): T {
    return parse(value, this);
  };
  return Record;
};

export type UnionConstructor<
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
): UnionConstructor<D, T> => ({
  name: "UnionConstructor",
  definitions,
  make(value: T): T {
    for (const definition of definitions) {
      if (definition.guard(value)) {
        return (definition as Constructor<T>).make(value);
      }
    }
    return value;
  },
  guard(subject: T): subject is T {
    return definitions.some((definition) => definition.guard(subject));
  },
  parse(value: unknown): T {
    return parse(value, this);
  },
});

type LiteralTypes =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | Record<string, unknown>;

export type LiteralConstructor<T extends LiteralTypes> = Constructor<T> & {
  name: "LiteralConstructor";
  value: T;
};
export const literal = <T extends LiteralTypes>(
  value: T,
): LiteralConstructor<T> => ({
  name: "LiteralConstructor",
  value,
  make(value: Identity<T>): T {
    return value;
  },
  guard(subject: T): subject is T {
    if (typeof value === "number" && Number.isNaN(value)) {
      return typeof subject === "number" && Number.isNaN(subject);
    }
    return value === subject;
  },
  parse(value: unknown): T {
    return parse(value, this);
  },
});

export type EnumConstructor<T extends LiteralTypes, A extends T[]> =
  & Constructor<A[number]>
  & {
    name: "EnumConstructor";
    values: A;
  };
export const enums = <T extends LiteralTypes, A extends T[]>(
  values: A,
): EnumConstructor<T, A> => ({
  name: "EnumConstructor",
  values,
  make(value: Identity<A[number]>): A[number] {
    return value;
  },
  guard(subject: A[number]): subject is A[number] {
    if (typeof subject === "number" && Number.isNaN(subject)) {
      return values.some(Number.isNaN);
    }
    return values.includes(subject);
  },
  parse(value: unknown): A[number] {
    return parse(value, this);
  },
});

export interface TupleConstructor<
  D extends Readonly<Constructor[]>,
  T extends ConstructorsToType<D>,
> extends Constructor<T>, Array<T> {
  name: string;
  definitions: D;
  (values: T[]): T[];
  new (values: T[]): T[];
}
export const tuple = <
  const D extends Readonly<Constructor[]>,
  T extends ConstructorsToType<D>,
>(
  definitions: D,
): TupleConstructor<D, T> => {
  const Tuple = function (this: typeof Tuple, values: T[]) {
    if (!(this instanceof Tuple)) {
      return new Tuple(values);
    }
    if (this.guard(values)) {
      this.push(...values);
    }
  } as TupleConstructor<D, T>;
  Tuple.definitions = definitions;
  Tuple.make = function (values: T) {
    return values;
  };
  Tuple.guard = function (values: unknown): values is T {
    if (!Array.isArray(values)) {
      return false;
    }
    for (const [index, definition] of definitions.entries()) {
      if (!definition.guard(values[index])) {
        return false;
      }
    }
    return true;
  };
  Tuple.parse = function (value: unknown): T {
    return parse(value, this);
  };
  return Tuple;
};

export const Data = {
  string,
  number,
  boolean,
  null: nil,
  nil,
  unknown,
  array,
  record,
  union,
  literal,
  enum: enums,
  enums,
  tuple,
};

export default Data;
