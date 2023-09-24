export type Identity<T> = T;
type Flatten<T extends object> = Identity<{ [k in keyof T]: T[k] }>;

export type Constructor<T = unknown> = {
  checkExpression: string;
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
export type ConstructorTupleToType<
  T extends (Constructor[] | Readonly<Constructor[]>),
> = {
  [K in keyof T]: ConstructorToType<T[K]>;
};
export type ConstructorRecordToType<
  T extends Record<string, Constructor>,
> = {
  [K in keyof T]: ConstructorToType<T[K]>;
};

const parserCache = new Map();
export function parse<T>(value: unknown, constructor: Constructor<T>): T {
  if (typeof constructor === "function" && value instanceof constructor) {
    return value as T;
  }
  if (parserCache.has(constructor)) {
    return parserCache.get(constructor)(value);
  }
  const fn = Function("value", `return ${constructor.checkExpression}`) as (
    value: unknown,
  ) => value is T;
  parserCache.set(constructor, fn);
  if (fn(value)) {
    return constructor.make(value);
  }
  throw new Error(`Can not parse ${value} into a ${constructor.name}`);
}

export class StringConstructor extends String {
  static checkExpression = 'typeof value === "string"';
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
  static checkExpression = 'typeof value === "number"';
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
  static checkExpression = 'typeof value === "boolean"';
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
  private constructor() {}
  static checkExpression = "value === null";
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
  private constructor() {}
  static checkExpression = "true";
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
> extends Constructor<T[]> {
  name: "ArrayConstructor";
  definitions: D;
}
export const array = <D extends Constructor, T extends ConstructorToType<D>>(
  definitions: D,
): ArrayConstructor<D, T> => {
  return class TypedArray {
    static definitions = definitions;
    static get checkExpression() {
      return `Array.isArray(value) && value.every((value) => ${definitions.checkExpression})`;
    }
    declare static foo: string;
    static make(values: T[]) {
      return values;
    }
    static guard(values: unknown): values is T[] {
      return Array.isArray(values) && values.every(definitions.guard);
    }
    static parse(value: unknown): T[] {
      return parse(value, this);
    }
  } as ArrayConstructor<D, T>;
};

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
    static get checkExpression() {
      const children = Array.from(definitions.entries())
        .map(([index, definition]) =>
          `((value) => ${definition.checkExpression})(value[${index}])`
        )
        .join(" && ");
      return `Array.isArray(value)` +
        ` && value.length === ${definitions.length}` +
        ` && ${children}`;
    }
    static make(values: T) {
      return values;
    }
    static guard(values: unknown): values is T {
      if (!Array.isArray(values) || values.length !== definitions.length) {
        return false;
      }
      for (const [index, definition] of definitions.entries()) {
        if (!definition.guard(values[index])) {
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
    static get checkExpression() {
      const children = (properties as string[])
        .map((key) =>
          `"${key}" in value` +
          ` && ((value) => ${
            definitions[key].checkExpression
          })(value["${key}"])`
        )
        .join(" && ");
      return `value !== null` +
        ` && typeof value === "object"` +
        ` && !(value instanceof Array)` +
        ` && ${children}`;
    }
    constructor(values: T) {
      for (const key of properties) {
        (this as unknown as T)[key] = values[key];
      }
    }
    static make(values: T) {
      return new this(values);
    }
    static guard(values: unknown): values is T {
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
    }
    static parse(value: unknown): T {
      return parse(value, this as RecordConstructor<T, D>);
    }
  } as RecordConstructor<T, D>;
};

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
    static get checkExpression() {
      const children = this.definitions
        .map((definition) => `(${definition.checkExpression})`)
        .join(" || ");
      return `(${children})`;
    }
    private constructor() {}
    static make(value: T): T {
      for (const definition of definitions) {
        if (definition.guard(value)) {
          return (definition as Constructor<T>).make(value);
        }
      }
      return value;
    }
    static guard(subject: T): subject is T {
      return definitions.some((definition) => definition.guard(subject));
    }
    static parse(value: unknown): T {
      return parse(value, this);
    }
  } as UnionConstructorType<D, T>;
};

type LiteralTypes =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | Record<string, unknown>;

export type LiteralConstructorType<T extends LiteralTypes> = Constructor<T> & {
  name: "LiteralConstructor";
  value: T;
};
export const literal = <T extends LiteralTypes>(
  value: T,
): LiteralConstructorType<T> => {
  return class LiteralConstructor {
    static value = value;
    static get checkExpression() {
      if (typeof value === "number" && Number.isNaN(value)) {
        return `typeof value === "number" && Number.isNaN(value)`;
      }
      return `value === ${JSON.stringify(value)}`;
    }
    private constructor() {}
    static make(value: Identity<T>): T {
      return value;
    }
    static guard(subject: T): subject is T {
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
    static get checkExpression() {
      if (!Array.isArray(this.values)) throw new Error("Enum must be an array");
      return JSON.stringify(this.values) + `.includes(value)`;
    }
    private constructor() {}
    static make(value: Identity<A[number]>): A[number] {
      return value;
    }
    static guard(subject: A[number]): subject is A[number] {
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
    static get checkExpression() {
      const children = Object.keys(definitions)
        .map((key) => `((value) => ${this.definitions[key]})(value["${key}"]))`)
        .join(" || ");
      return `(${children})`;
    }
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
    static guard(values: unknown): values is T {
      if (
        values === null || typeof values !== "object" || values instanceof Array
      ) {
        return false;
      }
      for (const key of properties) {
        if (
          key in values &&
          definitions[key as keyof D].guard((values as T)[key])
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
  tag,
};

export default Data;
