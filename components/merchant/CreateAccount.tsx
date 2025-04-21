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
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK } from "../../payment/test/ptbs/utils";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function MerchantSlug() {
  const account = useCurrentAccount();

  const user = account?.address;
  const [balance, setBalance] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  const [amount, setAmount] = useState("0");
  const [generatedPayId, setGeneratedPayId] = useState("");
  // const isLoading = !account?.address;

  const [shopName, setShopName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState("");
  const currentAccount = useCurrentAccount();
  // Get the user address from ZkLogin session or fallback to accountDetails
  const userAddress = user;
  console.log("NETWORK", NETWORK);
  useEffect(() => {
    if (!userAddress) return;
    getSuiBalance(userAddress).then(setBalance).catch(console.error);
  }, [user, isLoading, userAddress]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const tx = new Transaction();
      const paymentClient = await PaymentClient.init(NETWORK, user);

      paymentClient.createPaymentAccount(tx, shopName, {
        username: username,
        profilePicture: profilePicture,
      });

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: "sui:testnet",
        },
        {
          onSuccess: (result) => {
            console.log("object changes", result.objectChanges);
            setDigest(result.digest);
            setMessage("Payment account created successfully");
            setShopName("");
            setUsername("");
            setProfilePicture("");
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : "Transaction failed");
            console.error(err);
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment account"
      );
      console.error(err);
      setIsLoading(false); // In case the try block fails before `signAndExecuteTransaction`
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
              {user || "Not logged in"}
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
            <span className="text-sm"> Create Account</span>
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
              <div className="mb-4">
                <label htmlFor="shopName" className="block mb-2 font-medium">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="profilePicture"
                  className="block mb-2 font-medium"
                >
                  Profile Picture URL
                </label>
                <input
                  type="text"
                  id="profilePicture"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                />
              </div>

              {/* <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? "Creating..." : "Create Payment Account"}
              </button> */}

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
                >
                  Create Merchant Account
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
