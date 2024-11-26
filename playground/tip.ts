import {
  get_slot_api,
  get_slot_dbsync,
  get_tip_api,
  DatabaseBuilder,
} from "@studiowebux/cardano";

const blockfrost_url = "http://192.168.20.105:3010";
const blockfrost_api_key = "not_used";

Deno.test("Get Tip and Slot using blockfrost", async () => {
  const tip = await get_tip_api(blockfrost_url, blockfrost_api_key);
  const slot = await get_slot_api(blockfrost_url, blockfrost_api_key);

  console.log(tip, slot);
});

Deno.test("Get Slot using DB Sync", async () => {
  const sql = new DatabaseBuilder()
    .setReadUrl("postgres://postgres:example@192.168.20.105:5432/cexplorer")
    .build()
    .getReadConnection();
  const slot = await get_slot_dbsync(sql);

  console.log(slot);

  sql.end();
});
