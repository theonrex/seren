"use client";

import React, { useEffect, useState } from "react";
import { FaPaperPlane, FaDownload, FaExchangeAlt } from "react-icons/fa";
import { useSuiClient } from "@mysten/dapp-kit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export default function RecentTransactions({ merchantAddress }: any) {
  // Target merchant address to fetch transactions for
  const TARGET_ID = merchantAddress;
  const suiClient = useSuiClient();

  const [transactions, setTransactions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Function to fetch all payments from Firebase and filter by merchantAddress
  const fetchPayments = async () => {
    try {
      // console.log("Fetching payments from Firebase");
      const querySnapshot = await getDocs(collection(db, "payments"));

      const payments: {
        [x: string]: any; id: any 
}[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include payments where merchantAddress matches TARGET_ID
        if (data.merchantAddress === TARGET_ID) {
          payments.push({ id: doc.id, ...data });
        }
      });

      // console.log(`Found ${payments.length} payments for TARGET_ID`);
      return payments;
    } catch (error) {
      console.error("Error fetching payments from Firebase:", error);
      setError("Failed to fetch payment data");
      return [];
    }
  };

  // Function to fetch transaction details from Sui
  const fetchTransactionDetails = async (digestList: string[]) => {
    try {
      // console.log(`Fetching ${digestList.length} transaction details`);

      if (digestList.length === 0) return [];

      const transactionDetails = await Promise.all(
        digestList.map(async (digest: string) => {
          try {
            const txData = await suiClient.getTransactionBlock({
              digest,
              options: {
                showInput: true,
                showEffects: true,
                showEvents: true,
              },
            });
            return txData;
          } catch (err) {
            console.error(`Error fetching tx ${digest}:`, err);
            return null;
          }
        })
      );

      return transactionDetails.filter((tx) => tx !== null);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setError("Failed to fetch transaction details");
      return [];
    }
  };

  // Function to format transaction amount
  const formatAmount = (amountStr: any, coinType: string) => {
    try {
      const amount = Number(amountStr);
      const decimals = coinType === "0x2::sui::SUI" ? 9 : 6;
      return (amount / Math.pow(10, decimals)).toFixed(4);
    } catch (err) {
      console.error("Error formatting amount:", err);
      return "0";
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Get all payments for our target merchant
      const payments = await fetchPayments();

      // 2. Extract transaction digests
      const digestList = payments
        .map((payment) => payment.transactionDigest)
        .filter((digest) => digest);

      // 3. Fetch transaction details
      const txDetails = await fetchTransactionDetails(digestList);

      // 4. Combine payment data with transaction details
      const combinedData = txDetails.map((txDetail) => {
        const matchingPayment = payments.find(
          (p) => p.transactionDigest === txDetail.digest
        );
        return {
          ...txDetail,
          payment: matchingPayment,
        };
      });

      setTransactions(combinedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load transaction data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div>
      <div className="bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">
            Transaction History
          </h3>
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className={`text-xs ${
              isLoading ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
            } px-3 py-1 rounded-lg`}
          >
            {isLoading ? "Loading..." : "Refresh"}
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
        ) : error ? (
          <div className="text-center py-6 sm:py-8 text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchAllData}
              className="mt-3 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {transactions.map((tx: any) => {
              const payment = tx.payment || {};
              const amount = formatAmount(
                payment.amount || "0",
                payment.coinType
              );
              const coinSymbol =
                payment.coinType === "0x2::sui::SUI" ? "SUI" : "USDC";
              const timestamp = payment.timestamp?.toDate?.() || new Date();

              return (
                <a
                  href={`https://suiscan.xyz/testnet/tx/${tx.digest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={tx.digest}
                  className="bg-gray-800 rounded-xl p-3 sm:p-4 flex justify-between items-center hover:bg-gray-700 transition-colors block"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1 sm:p-2 rounded-full bg-green-900/30">
                      <FaDownload className="text-green-400 text-sm sm:text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                        {payment.description || "Received Payment"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-green-400">
                    {amount} {coinSymbol}
                  </span>
                </a>
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm sm:text-base">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
