import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

export const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
});
