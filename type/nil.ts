import { parse } from "./_shared.ts";

export class NullConstructor {
  private constructor() {}
  static make(value: null): null {
    return value;
  }
  static is(value: unknown): value is null {
    return value === null;
  }
  static parse(value: unknown): null {
    return parse(value, this);
  }
}
export const nil = () => NullConstructor;
