import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

export const NETWORK = "testnet";
export const testKeypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from("AM06bExREdFceWiExfSacTJ+64AQtFl7SRkSiTmAqh6F", "base64")).slice(1));;

export const ACCOUNT = "0xea808d9cac0cd0e048f3e1030e58dad8029e4c1fcb1ed21657162ef658808e3f";

export async function executeTx(tx: Transaction) {
    const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

    tx.setGasBudget(1000000000);
    const result = await client.signAndExecuteTransaction({
        signer: testKeypair,
        transaction: tx,
        options: { showEffects: true, showObjectChanges: true },
        requestType: "WaitForLocalExecution"
    });

    if (result.effects?.status.status != "success") {
        console.log(result.effects?.status.error);
    }

    console.log(result.effects?.status.status);
    console.log(result.effects?.created);
}