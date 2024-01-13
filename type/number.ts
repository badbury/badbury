import { parse } from "./_shared.ts";

export class NumberConstructor extends Number {
  static make(value: number): number {
    return value;
  }
  static is(value: unknown): value is number {
    return typeof value === "number";
  }
  static parse(value: unknown): number {
    return parse(value, this);
  }
}
export const number = () => NumberConstructor;
