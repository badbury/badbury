import { parse } from "./_shared.ts";

export class UnknownConstructor {
  private constructor() {}
  static make(value: unknown): unknown {
    return value;
  }
  static is(_: unknown): _ is unknown {
    return true;
  }
  static parse(value: unknown): unknown {
    return parse(value, this);
  }
}
export const unknown = () => UnknownConstructor;
