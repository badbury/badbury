import { protocol } from "./protocols.ts";

export const doThing = protocol<(one: string, two: number) => string>();
