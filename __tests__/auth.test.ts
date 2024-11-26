import { assertEquals } from "@std/assert";
import { authenticate } from "../src/csl/authenticate.ts";

Deno.test("authenticate", () => {
  const cose_signature =
    "84582aa201276761646472657373581de182405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed9a166686173686564f458436163636f756e743a20653138323430353731376636643862376437613862646432373537303031363135343864623563366561333861356165353936346466366564395840ac5c608427ae5435cefbf1af46d53db4968505c36cf9bbd51a16a922caf166ef1e946a42a2e0049aa8193f8e708ea2a34d40f678ea9d6836890c820405d48a08";
  const cose_key =
    "a4010103272006215820c6996ee96ffde13788236fa3860fd7d745405c046238e212123e862045919dfd";

  const authorized = authenticate(cose_signature, cose_key);

  // console.log("Is Authorized ?", authorized);

  assertEquals(authorized, {
    success: true,
    stake_address: {
      hex: "e182405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed9",
      besh32: "stake1uxpyq4ch7mvt04aghhf82uqpv92gmdwxagu2ttjevn0kakg4xtnc3",
    },
  });
});
