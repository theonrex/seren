"use client";

import React, { useEffect, useState } from "react";
import Balance from "../Balance";
import { FaPaperPlane } from "react-icons/fa";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK } from "../../payment/test/ptbs/utils";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";

// Target package ID
const TARGET_PACKAGE_ID =
  "0x841fd25185f32719f2003fe80a34e934b00fd06ae393a96c8043eeddb0c134d9";

export default function ClientPage() {
  const suiClient = useSuiClient();

  const [tip, setTip] = useState("0");
  const [paymentId, setPaymentId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [filteredTxHistory, setFilteredTxHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  // const handlePayment = async () => {
  //   if (!paymentId || !tip) {
  //     setStatus("❌ Please enter a valid Payment ID and Tip.");
  //     return;
  //   }

  //   if (!account) {
  //     setStatus("❌ No wallet connected.");
  //     return;
  //   }

  //   try {
  //     setStatus("⏳ Processing payment...");

  //     const paymentClient = await PaymentClient.init(
  //       NETWORK,
  //       account.address,
  //       "0x21aa14a1466461b3096ca43420f38d8c6002e01684dcb9f28feb0eb5c99912ae"
  //     );

  //     const tx = new Transaction();
  //     tx.setSender(account.address);
  //     await paymentClient.makePayment(tx, paymentId, BigInt(tip));

  //     const result = await signAndExecuteTransaction({
  //       transaction: tx,
  //       chain: "sui:testnet",
  //       options: {
  //         showEffects: true,
  //         showEvents: true,
  //       },
  //     });

  //     const txStatus = result.effects?.status.status;
  //     if (txStatus !== "success") {
  //       console.error(result.effects?.status.error);
  //       setStatus("❌ Payment failed.");
  //       return;
  //     }

  //     const data = result.events?.[0]?.parsedJson as any;
  //     setStatus(`✅ Paid ${data.amount} with Tip ${data.tip}`);
  //     fetchHistory(); // Refresh history after successful tx
  //   } catch (err) {
  //     console.error("❌ Payment Error:", err);
  //     setStatus("❌ Payment failed.");
  //   }
  // };

  const fetchHistory = async () => {
    if (!account) return;
    try {
      setIsLoading(true);
      const { data } = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: account.address,
        },
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
        },
        limit: 50,
        order: "descending",
      });

      // Filter transactions that have events from our target package ID
      const filtered = data.filter((tx) => {
        if (!tx.events || tx.events.length === 0) return false;
        return tx.events.some((event) => event.packageId === TARGET_PACKAGE_ID);
      });

      setFilteredTxHistory(filtered);
    } catch (error) {
      console.error("❌ Failed to fetch transaction history", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchHistory();
    } else {
      setIsLoading(false); // No account, so no loading needed
    }
  }, [account?.address]);

  // Determine if a transaction is a withdrawal based on event type or other criteria
  const isWithdrawal = (eventType: string | string[]) => {
    // Customize this logic based on how withdrawals are identified in your system
    return eventType && eventType.includes("Withdraw");
  };

  return (
    <div className="p-4">
      <Balance />

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">
          Payment History (Package ID: {TARGET_PACKAGE_ID.slice(0, 10)}...)
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : filteredTxHistory.length === 0 ? (
          <p className="text-gray-400">
            No transaction history found for this package ID.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTxHistory.map((tx) => {
              // Find event from target package
              const relevantEvent = tx.events?.find(
                (event: { packageId: string }) =>
                  event.packageId === TARGET_PACKAGE_ID
              );

              const parsedData = relevantEvent?.parsedJson || {};
              const timestamp = new Date(
                parseInt(tx.timestampMs ?? "0")
              ).toLocaleString();

              const eventType =
                relevantEvent?.type?.split("::").slice(-1)[0] ||
                "Unknown Event";
              const withdrawal = isWithdrawal(eventType);

              return (
                <div
                  key={tx.digest}
                  className="bg-gray-800 rounded-xl p-4 flex justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FaPaperPlane
                      className={`text-xl ${
                        withdrawal ? "text-red-500" : "text-blue-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Payment ID:</span>{" "}
                        {parsedData.payment_id
                          ? `${parsedData.payment_id.slice(0, 8)}...`
                          : "N/A"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Issued By:</span>{" "}
                        {parsedData.issued_by
                          ? `${parsedData.issued_by.slice(0, 8)}...`
                          : tx.transaction?.sender?.slice(0, 8) + "..."}
                      </p>
                      <p className="text-xs text-gray-400">{timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        withdrawal ? "text-red-500" : "text-green-400"
                      }`}
                    >
                      {parsedData.amount
                        ? `${withdrawal ? "+" : "-"}${
                            Number(parsedData.amount) / 1e9
                          } SUI`
                        : "Amount N/A"}
                    </span>
                    <p className="text-xs text-gray-400">{eventType}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
