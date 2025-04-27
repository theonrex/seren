import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { useSuiClient } from "@mysten/dapp-kit";
export default function Payment() {
  const [openModal, setOpenModal] = useState(false);
  const [tip, setTip] = useState("0");
  const [paymentId, setPaymentId] = useState("");
  const [merchantAccount, setMerchantAccount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [url, setUrl] = useState(""); // New state for storing the pasted URL
  const client = useSuiClient();

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  // Function to extract merchantaccount and paymentId from the URL
  const handleUrlChange = (e: any) => {
    setUrl(e.target.value); // Update URL state
    const urlParams = new URLSearchParams(new URL(e.target.value).search);
    const extractedMerchantAccount = urlParams.get("merchantaccount");
    const extractedPaymentId = urlParams.get("paymentId");

    if (extractedMerchantAccount) {
      setMerchantAccount(extractedMerchantAccount); // Update merchantAccount state
    }
    if (extractedPaymentId) {
      setPaymentId(extractedPaymentId); // Update paymentId state
    }
  };

  const handlePayment = async () => {
    // console.log("📝 Payment attempt initiated");
    // console.log("📦 Payment ID:", paymentId);
    // console.log("💸 Tip (MIST):", tip);
    // console.log("💼 Merchant Account:", merchantAccount);

    if (!paymentId || !tip || !merchantAccount) {
      setStatus(
        "❌ Please enter a valid Payment ID, Tip, and Merchant Account."
      );
      return;
    }

    if (!account) {
      setStatus("❌ No wallet connected.");
      return;
    }

    try {
      setStatus("⏳ Processing payment...");

      const paymentClient = await PaymentClient.init(
        NETWORK,
        account?.address,
        merchantAccount
      );

      const tx = new Transaction();

      tx.setSender(account.address);
      // Optional: let the wallet set gas
      await paymentClient.makePayment(tx, paymentId, BigInt(tip));

      const result = await signAndExecuteTransaction({
        transaction: await tx.toJSON(),
        chain: "sui:testnet", // or "sui:mainnet"
      });

      const transactionBlock = await client.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      // Now you can safely access status!
      const status = transactionBlock.effects?.status;
      const txStatus = transactionBlock.effects?.status?.status;
      // const status = result.effects?.status;
      console.log("status", status);
      if (txStatus !== "success") {
        // console.error(result.effects?.status.status.error);
        setStatus("❌ Payment failed.");
        return;
      }

      const data = transactionBlock.events?.[0]?.parsedJson as any;
      console.log("First event data:", data); // console.log("✅ Payment Success:", data);
      setStatus(`✅ Paid ${data.amount} with Tip ${data.tip}`);
    } catch (err) {
      console.error("❌ Payment Error:", err);
      setStatus("❌ Payment failed.");
    }
  };

  return (
    <div className="payment-container">
      <div className="make-payment-btn">Make Payment</div>

      <div className="payment-form">
        <div className="form-body">
          <div className="input-group">
            <label className="input-label">Paste Link</label>
            <input
              type="text"
              value={url}
              onChange={handleUrlChange} // Handle link change
              className="input-field"
              placeholder="Paste the payment link here"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Tip (in MIST)</label>
            <input
              type="number"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="input-field"
              placeholder="Enter optional tip"
            />
          </div>
          {status && <p className="status-message">{status}</p>}
        </div>
        <div className="pay-btn-container">
          <Button onClick={handlePayment} className="pay-btn">
            Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
