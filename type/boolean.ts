import { parse } from "./_shared.ts";

export class BooleanConstructor extends Boolean {
  static make(value: boolean): boolean {
    return value;
  }
  static is(value: unknown): value is boolean {
    return typeof value === "boolean";
  }
  static parse(value: unknown): boolean {
    return parse(value, this);
  }
}
export const boolean = () => BooleanConstructor;
