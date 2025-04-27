import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../payment/src/payment-client";
import {
  ACCOUNT,
  executeTx,
  NETWORK,
  testKeypair,
} from "../payment/test/ptbs/utils";

export async function makePayment(paymentId: string, tipAmount: bigint) {
  const paymentClient = await PaymentClient.init(
    NETWORK,
    testKeypair.toSuiAddress(),
    ACCOUNT
  );

  const tx = new Transaction();
  tx.setGasBudget(1000000000); // optional: handled by wallet if left unset

  paymentClient.makePayment(tx, paymentId, tipAmount);

  const result = await paymentClient.client.signAndExecuteTransaction({
    signer: testKeypair,
    transaction: tx,
    options: { showEffects: true, showEvents: true },
    requestType: "WaitForLocalExecution",
  });

  const status = result.effects?.status.status;
  if (status !== "success") {
    console.error(result.effects?.status.error);
    throw new Error("Payment failed");
  }

  const data = result.events?.[0]?.parsedJson as any;
  return {
    paymentId: data.payment_id,
    timestamp: data.timestamp,
    paidAmount: data.amount,
    tipAmount: data.tip,
    issuedBy: data.issued_by,
  };
}
