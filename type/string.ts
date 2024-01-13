import { parse } from "./_shared.ts";

export class StringConstructor extends String {
  static make(value: string): string {
    return value;
  }
  static is(value: unknown): value is string {
    return typeof value === "string";
  }
  static parse(value: unknown): string {
    return parse(value, this);
  }
}
export const string = () => StringConstructor;
