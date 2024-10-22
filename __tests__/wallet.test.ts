import { create_wallet } from "@studiowebux/cardano";

Deno.test("Create new wallet", () => {
  create_wallet(false);
});
