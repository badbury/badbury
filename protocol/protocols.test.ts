// import * as Foo from './foo';
import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";
import { assertProtocolsAreBound, bind } from "./protocols.ts";

Deno.test("Duno", async () => {
  const { main } = await import("./thing-using-foo.ts");

  // bindContract(Foo).to();
  // await register();
  await bind({
    protocol: () => import("./foo.ts"),
    to: () => ({
      doThing: () => "mocked boy",
    }),
  });

  assertEquals(main(), "mocked boy 123");
  assertProtocolsAreBound();
});
