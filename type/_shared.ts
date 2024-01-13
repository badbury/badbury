export type Identity<T> = T;
export type Flatten<T extends object> = Identity<{ [k in keyof T]: T[k] }>;

export type Constructor<T = unknown> = {
  make(t: T): T;
  is(subject: unknown): subject is T;
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

export function parse<T>(value: unknown, constructor: Constructor<T>): T {
  if (typeof constructor === "function" && value instanceof constructor) {
    return value as T;
  }
  if (constructor.is(value)) {
    return constructor.make(value);
  }
  throw new Error(`Can not parse ${value} into a ${constructor.name}`);
}

export type LiteralTypes =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | Record<string, unknown>;
