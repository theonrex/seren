import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK } from "../../payment/test/ptbs/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SetOwner() {
  const router = useRouter();
  const { id } = router.query;

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const user: string = currentAccount!?.address;

  const [paymentClient, setPaymentClient] = useState<PaymentClient | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const client = await PaymentClient.init(NETWORK, user, ACCOUNT);
        const userAccounts = client.getUserPaymentAccounts();
        const accountId = userAccounts.find((a) => a.id === id)?.id;

        if (accountId) {
          await client.switchAccount(accountId);
        }

        setPaymentClient(client);
      } catch (err) {
        console.error("Error loading payment data:", err);
        toast.error("Failed to load payment data!");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [id, currentAccount]);

  const handleSetRecovery = async () => {
    if (!paymentClient || !ownerAddress) return;
    setIsSubmitting(true);

    try {
      const tx = new Transaction();
      const idString = Array.isArray(id) ? id[0] : id;

      const paymentClient = await PaymentClient.init(NETWORK, user, idString);
      paymentClient.setOwnerAddress(tx, ownerAddress);

      const result = await signAndExecuteTransaction({
        transaction: await tx.toJSON(),
        chain: "sui:testnet",
      });

      toast.success("Recovery address set successfully!");
    } catch (err) {
      console.error("Failed to set recovery address:", err);
      toast.error("Failed to set recovery address!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-lg shadow-sm dark:bg-gray-700 w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Set Recovery Address
          </h3>
        </div>

        <div className="p-4 md:p-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter Recovery Address
          </label>
          <input
            type="text"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            placeholder="0x..."
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white p-2"
          />
        </div>

        <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button
            onClick={handleSetRecovery}
            disabled={isSubmitting || !ownerAddress || loading}
            className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 disabled:opacity-50"
          >
            {(isSubmitting || loading) && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {isSubmitting
              ? "Setting..."
              : loading
              ? "Loading..."
              : "Set Recovery Address"}
          </button>
        </div>
      </div>
    </div>
  );
}
