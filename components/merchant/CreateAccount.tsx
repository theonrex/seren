"use client";

import React, { useEffect, useState } from "react";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { getSuiBalance } from "@/utils/getBalance";
import {
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaPaperPlane,
} from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";

import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "./utils";

export default function MerchantSlug({ accountDetails }) {
  const { user, isLoading } = useZkLoginSession();
  const [balance, setBalance] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  const [amount, setAmount] = useState("0");
  const [generatedPayId, setGeneratedPayId] = useState("");

  useEffect(() => {
    const address = accountDetails;
    if (!address) return;

    getSuiBalance(address).then(setBalance).catch(console.error);
  }, [user, isLoading]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleGeneratePayId = async () => {
    try {
      const tx = new Transaction();
      tx.setGasBudget(1000000000);

      const paymentClient = await PaymentClient.init(
        NETWORK,
        testKeypair.toSuiAddress(),
        ACCOUNT
      );

      paymentClient.issuePayment(tx, description, coinType, BigInt(amount));

      const result = await paymentClient.client.signAndExecuteTransaction({
        signer: testKeypair,
        transaction: tx,
        options: { showEffects: true, showEvents: true },
        requestType: "WaitForLocalExecution",
      });

      if (result.effects?.status.status !== "success") {
        console.error("Failed issuing payment:", result.effects?.status.error);
        alert("Payment creation failed.");
        return;
      }

      const payId = result.events?.[0]?.parsedJson?.payment_id;
      const link = `${window.location.origin}/pay/${payId}`;
      setGeneratedPayId(link);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Error generating Pay ID.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Wallet Address & Balance */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
            <p className="text-md font-mono bg-gray-800 p-2 rounded-lg inline-block break-words">
              {accountDetails || "Not logged in"}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-md">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold">
              {balance !== null ? `${balance} SUI` : "Loading..."}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer">
            <FaArrowDown className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Deposit</span>
          </div>
          <div
            className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer"
            onClick={handleOpenModal}
          >
            <FaArrowUp className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Issue Payment</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer">
            <FaMoneyBillWave className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Earn</span>
          </div>
        </div>

        {/* Payment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold mb-4">Create Payment Request</h2>
              <label className="text-sm">Description</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label className="text-sm">Coin Type</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={coinType}
                onChange={(e) => setCoinType(e.target.value)}
              />

              <label className="text-sm">Amount (in smallest units)</label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePayId}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
                >
                  Generate Pay Link
                </button>
              </div>

              {generatedPayId && (
                <div className="mt-4 bg-gray-800 p-3 rounded text-sm break-words">
                  <strong>Pay Link:</strong>
                  <br />
                  <a
                    href={generatedPayId}
                    className="text-blue-400 underline"
                    target="_blank"
                  >
                    {generatedPayId}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
