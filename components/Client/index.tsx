import React, { useState } from "react";
import Balance from "../Balance";
import {
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaPaperPlane,
} from "react-icons/fa";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";

export default function ClientPage() {
  const [openModal, setOpenModal] = useState(false);
  const [tip, setTip] = useState("0");
  const [paymentId, setPaymentId] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const handlePayment = async () => {
    console.log("📝 Payment attempt initiated");
    console.log("📦 Payment ID:", paymentId);
    console.log("💸 Tip (MIST):", tip);

    if (!paymentId || !tip) {
      setStatus("❌ Please enter a valid Payment ID and Tip.");
      return;
    }

    if (!account) {
      setStatus("❌ No wallet connected.");
      return;
    }

    try {
      setStatus("⏳ Processing payment...");

      //8cb92d1ab261aefa3a7ffa516df2ca053c9f9f0325e7f09fdbef0202f0df12c3

      const paymentClient = await PaymentClient.init(
        NETWORK,
        account?.address,
        "0x21aa14a1466461b3096ca43420f38d8c6002e01684dcb9f28feb0eb5c99912ae"
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
        // requestType: "WaitForLocalExecution",
      });

      const status = result.effects?.status.status;
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
    <div className="p-4">
      <Balance />


      {/* History Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">History</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i, idx) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                {idx === 2 ? (
                  <FaPaperPlane className="text-red-500 text-xl" />
                ) : (
                  <FaPaperPlane className="text-blue-400 text-xl" />
                )}
                <div>
                  <p className="text-sm">To julien.sui</p>
                  <p className="text-xs text-gray-400">12.03.2025 - 14:02:34</p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  idx === 2 ? "text-red-400" : "text-green-400"
                }`}
              >
                {idx === 2 ? "-$1233.23" : "+$1233.23"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
