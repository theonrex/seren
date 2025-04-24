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

export default function Payment() {
  const [openModal, setOpenModal] = useState(false);
  const [tip, setTip] = useState("0");
  const [paymentId, setPaymentId] = useState("");
  const [merchantAccount, setMerchantAccount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [url, setUrl] = useState(""); // New state for storing the pasted URL

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  // Function to extract merchantaccount and paymentId from the URL
  const handleUrlChange = (e) => {
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
    console.log("📝 Payment attempt initiated");
    console.log("📦 Payment ID:", paymentId);
    console.log("💸 Tip (MIST):", tip);
    console.log("💼 Merchant Account:", merchantAccount);

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
        transaction: tx,
        chain: "sui:testnet", // or "sui:mainnet"
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      const status = result.effects?.status;
      console.log("status", status);
      if (status !== "success") {
        console.error(result.effects?.status.error);
        setStatus("❌ Payment failed.");
        return;
      }

      const data = result.events?.[0]?.parsedJson as any;
      console.log("✅ Payment Success:", data);
      setStatus(`✅ Paid ${data.amount} with Tip ${data.tip}`);
    } catch (err) {
      console.error("❌ Payment Error:", err);
      setStatus("❌ Payment failed.");
    }
  };

  return (
    <div>
      <div onClick={() => setOpenModal(true)}>Make Payment</div>

      <div>
        <header>Make Payment</header>
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white">Paste Link</label>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange} // Handle link change
                className="w-full rounded bg-gray-700 text-white px-3 py-2"
                placeholder="Paste the payment link here"
              />
            </div>
            <div>
              <label className="block text-sm text-white">Tip (in MIST)</label>
              <input
                type="number"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="w-full rounded bg-gray-700 text-white px-3 py-2"
                placeholder="Enter optional tip"
              />
            </div>
            {status && (
              <p className="mt-2 text-sm text-center text-gray-400">{status}</p>
            )}
          </div>
        </div>
        <div>
          <Button onClick={handlePayment}>Pay</Button>
        </div>
      </div>
    </div>
  );
}
