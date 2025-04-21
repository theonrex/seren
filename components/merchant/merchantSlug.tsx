"use client";

import React, { useEffect, useState } from "react";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { getSuiBalance } from "@/utils/getBalance";
import { FaArrowDown, FaMoneyBillWave } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import IssuePaymentModal from "./modal";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function MerchantSlug({ merchantAddress }) {
  const account = useCurrentAccount();

  const user = account?.address;
  const [balance, setBalance] = useState(null);
  const [pendingPayments, setPendingPayments] = useState(null); // State to store pending payments
  const isLoading = !account?.address;

  // Payment parameters
  useEffect(() => {
    const address = merchantAddress;
    if (!address) return;

    getSuiBalance(address).then(setBalance).catch(console.error);
  }, [user, isLoading]);

  // Fetch pending payments
  useEffect(() => {
    if (!merchantAddress) return; // Ensure merchantAddress is available

    const fetchPendingPayments = async () => {
      try {
        const paymentClient = await PaymentClient.init(
          NETWORK,
          testKeypair.toSuiAddress(),
          merchantAddress
        );
        const payments = await paymentClient.getPendingPayments();
        setPendingPayments(payments); // Assuming payments is an object
      } catch (error) {
        console.error("Error fetching pending payments:", error);
      }
    };

    fetchPendingPayments();
  }, [merchantAddress]);

  // Helper function to convert BigInt to a readable format with decimals
  const formatAmount = (amount) => {
    if (typeof amount === "bigint") {
      // Assuming SUI has 9 decimals
      const amountInDecimal = Number(amount) / 1e9;
      return amountInDecimal.toFixed(9); // Formatting to 9 decimal places
    }
    return amount;
  };

  console.log("pendingPayments", pendingPayments);
  console.log("pendingPayments", pendingPayments);
  console.log("merchantAddress", merchantAddress);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Wallet Address */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
            <p className="text-md font-mono bg-gray-800 p-2 rounded-lg inline-block break-words">
              {merchantAddress || "Not logged in"}
            </p>
          </div>
        </div>

        {/* Balance Card */}
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

          <IssuePaymentModal merchantAddress={merchantAddress} />

          <div className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer">
            <FaMoneyBillWave className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Earn</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Pending</h3>
              <a href="#" className="text-blue-400 text-sm hover:underline">
                See All
              </a>
            </div>
            <div className="space-y-3">
              {pendingPayments && Object.keys(pendingPayments).length > 0 ? (
                Object.keys(pendingPayments).map((key) => {
                  const payment = pendingPayments[key];
                  return (
                    <div
                      key={key}
                      className="bg-gray-800 rounded-xl p-4 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <AiOutlinePlus className="text-green-500 text-xl" />
                        <div>
                          <p className="text-sm">
                            {payment.fields.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.date}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-semibold">
                        +${formatAmount(payment.args.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">No pending payments</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
      </div>
    </div>
  );
}
