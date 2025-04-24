import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK } from "../../payment/test/ptbs/utils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronRight, FaCopy, FaArrowLeft } from "react-icons/fa";

export default function SetOwner() {
  const router = useRouter();
  const { id } = router.query;

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [paymentClient, setPaymentClient] = useState<PaymentClient | null>(
    null
  );
  const [paymentAccount, setPaymentAccount] = useState(null);
  const [ownedObjects, setOwnedObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!currentAccount?.address) return;

      try {
        setLoading(true);

        const client = await PaymentClient.init(
          NETWORK,
          currentAccount.address,
          ACCOUNT
        );

        const userAccounts = client.getUserPaymentAccounts();
        const accountId = userAccounts.find((a) => a.id === id)?.id;

        if (accountId) {
          await client.switchAccount(accountId);
        }

        setPaymentClient(client);
        setPaymentAccount(client.paymentAccount);

        const objects = await client.getOwnedObjects();
        setOwnedObjects(objects);
      } catch (err) {
        console.error("Error loading payment data:", err);
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

      const paymentClient = await PaymentClient.init(
        NETWORK,
        currentAccount.address,
        id
      );
      paymentClient.setOwnerAddress(tx, ownerAddress);

      const result = await signAndExecuteTransaction({
        transaction: tx,
        chain: "sui:testnet",
      });
      console.log("Recovery address set:", result);

      toast.success("Recovery address set successfully!");

      // Manually close the modal
    } catch (err) {
      console.error("Failed to set recovery address:", err);
      toast.error("Failed to set recovery address!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="profile_div"
      data-modal-target="static-modal"
      data-modal-toggle="static-modal"
    >
      <span>Set Owner Address</span>
      {/*               <span className="profile_link_span">
       */}
      <div className="profile_link_span">
        <button
          data-modal-target="static-modal"
          data-modal-toggle="static-modal"
          // className="block text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
        >
          <FaChevronRight className="chevron-icon" />
        </button>

        <div
          id="static-modal"
          data-modal-backdrop="static"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Set Recovery Address
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="static-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
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
                  disabled={isSubmitting || !ownerAddress}
                  className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 disabled:opacity-50"
                >
                  {isSubmitting && (
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
                  {isSubmitting ? "Setting..." : "Set Recovery Address"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
