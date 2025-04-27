import React, { useEffect, useState } from "react";
import { getSuiBalance } from "@/utils/getBalance";
import {
  FaArrowDown,
  FaMoneyBillWave,
  FaArrowUp,
  FaHistory,
  FaCopy,
} from "react-icons/fa";
import { AiOutlinePlus, AiOutlineCopy } from "react-icons/ai";
import IssuePaymentModal from "./modal";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
export default function MerchantSlug({ merchantAddress }: any) {
  const account = useCurrentAccount();
  const user: string = account!.address;

  const [balance, setBalance] = useState<string>("0");
  const [pendingPayments, setPendingPayments] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  console.log("pendingPayments", pendingPayments);

  useEffect(() => {
    if (!merchantAddress) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch balance
        const balanceData = await getSuiBalance(merchantAddress);
        setBalance(balanceData);

        // Fetch pending payments
        const paymentClient = await PaymentClient.init(
          NETWORK,
          user,
          merchantAddress
        );
        const payments = await paymentClient.getPendingPayments();
        setPendingPayments(payments);

        // For demo purposes, let's create some mock recent transactions
        setRecentTransactions([
          {
            id: "1",
            description: "Payment from Customer A",
            amount: 2.5,
            date: "2025-04-22",
            type: "incoming",
          },
          {
            id: "2",
            description: "Platform fee",
            amount: 0.15,
            date: "2025-04-21",
            type: "outgoing",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [merchantAddress]);

  // Helper function to format amount with proper decimals
  const formatAmount = (amount: number) => {
    if (typeof amount === "bigint") {
      const amountInDecimal = Number(amount) / 1e9;
      return amountInDecimal.toFixed(4);
    }
    return amount;
  };

  // Helper function to truncate address for display
  const truncateAddress = (address: string, isMobile = false) => {
    if (!address) return "";
    if (isMobile) {
      return `${address.substring(0, 6)}...${address.substring(
        address.length - 4
      )}`;
    }
    return `${address.substring(0, 10)}...${address.substring(
      address.length - 6
    )}`;
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    if (!merchantAddress) return;
    navigator.clipboard.writeText(merchantAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-sky-400 px-4 py-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with back link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/merchant">
            <span className="flex items-center text-sky-500 hover:text-sky-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Accounts
            </span>
          </Link>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <span className="text-gray-400 text-sm">Merchant Dashboard</span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Merchant Address</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <p className="text-sm sm:text-md font-mono bg-gray-800 p-2 rounded-lg break-all w-full sm:w-auto">
              <span className="hidden sm:inline">
                {merchantAddress
                  ? truncateAddress(merchantAddress)
                  : "Not available"}
              </span>
              <span className="inline sm:hidden">
                {merchantAddress
                  ? truncateAddress(merchantAddress, true)
                  : "Not available"}
              </span>
            </p>
            <button
              onClick={copyToClipboard}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="Copy address"
            >
              <FaCopy className="text-sky-400" />
              <span className="sm:hidden">{copied ? "Copied!" : "Copy"}</span>
              {copied && (
                <span className="hidden sm:inline text-green-400 text-sm">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Total Balance</p>
          {isLoading ? (
            <div className="h-10 flex items-center">
              <div className="animate-pulse bg-gray-800 rounded h-8 w-32"></div>
            </div>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
              {balance !== null ? `${balance} SUI` : "No balance"}
            </h2>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            <button className="flex items-center justify-center gap-1 sm:gap-2 bg-sky-900 hover:bg-sky-800 text-white py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base">
              <FaArrowDown className="text-sm" />
              <span>Deposit</span>
            </button>
            <button className="flex items-center justify-center gap-1 sm:gap-2 bg-gray-800 hover:bg-gray-700 text-sky-400 py-2 px-3 sm:px-4 rounded-lg border border-sky-800 transition-colors text-sm sm:text-base">
              <FaArrowUp className="text-sm" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center">
            <FaHistory className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
            <span className="text-xs sm:text-sm">History</span>
          </div>{" "}
          <div className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center">
            <IssuePaymentModal merchantAddress={merchantAddress} />
          </div>
          <div className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center">
            <FaMoneyBillWave className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
            <span className="text-xs sm:text-sm">Earn</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Pending Payments Section */}
          <div className="bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Pending Payments
              </h3>
              <button className="text-sky-400 text-xs sm:text-sm hover:text-sky-300 transition-colors">
                See All
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-800 h-12 sm:h-16 rounded-xl"
                  ></div>
                ))}
              </div>
            ) : pendingPayments && Object.keys(pendingPayments).length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {Object.keys(pendingPayments).map((key) => {
                  const payment = pendingPayments[key];
                  const account = payment.fields?.account;
                  const paymentKey = payment.fields?.key;

                  const linkToCopy = `https://your-link.com?account=${account}&key=${paymentKey}`;

                  return (
                    <div
                      key={key}
                      className="bg-gray-800 rounded-xl p-3 sm:p-4 flex justify-between items-center hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-green-900/30 p-1 sm:p-2 rounded-full">
                          <AiOutlinePlus className="text-green-400 text-sm sm:text-lg" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {payment.fields?.description || "Payment"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.date || "Pending"}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-semibold text-sm sm:text-base">
                        +{formatAmount(payment.args?.amount || 0)} SUI
                      </span>
                      <div className="flex items-center">
                        <CopyToClipboard text={linkToCopy}>
                          <button className="text-gray-400 hover:text-gray-200 transition-colors">
                            <AiOutlineCopy className="text-lg" />
                          </button>
                        </CopyToClipboard>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm sm:text-base">No pending payments</p>
              </div>
            )}
          </div>

          {/* Recent Transactions Section */}
          <div className="bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Recent Transactions
              </h3>
              <button className="text-sky-400 text-xs sm:text-sm hover:text-sky-300 transition-colors">
                View All
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-800 h-12 sm:h-16 rounded-xl"
                  ></div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map(
                  (tx: {
                    id: React.Key | null | undefined;
                    type: string;
                    description: string | null | undefined;
                    date: string | number | bigint | null | undefined;
                    amount: string | number | bigint | null | undefined;
                  }) => (
                    <div
                      key={tx.id}
                      className="bg-gray-800 rounded-xl p-3 sm:p-4 flex justify-between items-center hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`p-1 sm:p-2 rounded-full ${
                            tx.type === "incoming"
                              ? "bg-green-900/30"
                              : "bg-red-900/30"
                          }`}
                        >
                          {tx.type === "incoming" ? (
                            <AiOutlinePlus className="text-green-400 text-sm sm:text-lg" />
                          ) : (
                            <FaArrowUp className="text-red-400 text-sm sm:text-lg" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                            {tx.description}
                          </p>
                          <p className="text-xs text-gray-400">{tx.date}</p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold text-sm sm:text-base ${
                          tx.type === "incoming"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {tx.type === "incoming" ? "+" : "-"}
                        {tx.amount} SUI
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm sm:text-base">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
