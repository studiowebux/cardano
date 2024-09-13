import { create_wallet } from "../src/csl/wallet.csl.ts";

Deno.test("Create new wallet", () => {
  create_wallet(true);
});
