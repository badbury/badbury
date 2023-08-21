import { doThing } from "./foo.ts";

export function main() {
  return doThing("main", 1) + " 123";
}

export function create({ doThing }: {
  doThing: (one: string, two: number) => string;
}) {
  return {
    main: () => {
      return doThing("main", 1) + " 123";
    },
  };
}
