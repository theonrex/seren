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

export default function SetRecovery() {
  const router = useRouter();
  const { id } = router.query;

  const currentAccount = useCurrentAccount();
  const user: string = currentAccount!?.address;

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [paymentClient, setPaymentClient] = useState<PaymentClient | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryAddress, setRecoveryAddress] = useState("");

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
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [id, currentAccount]);

  const handleSetRecovery = async () => {
    if (!paymentClient || !recoveryAddress) return;
    setIsSubmitting(true);

    try {
      const tx = new Transaction();
      const idString = Array.isArray(id) ? id[0] : id;

      const paymentClient = await PaymentClient.init(NETWORK, user, idString);
      paymentClient.setRecoveryAddress(tx, recoveryAddress);

      await signAndExecuteTransaction({
        transaction: await tx.toJSON(),
        chain: "sui:testnet",
      });

      toast.success("Recovery address set successfully!");
      setRecoveryAddress(""); // Clear input after success
    } catch (err) {
      console.error("Failed to set recovery address:", err);
      toast.error("Failed to set recovery address!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md custom-blue p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Set Recovery Address
        </h1>

        <label className="block text-sm font-medium text-white-700 mb-2">
          Recovery Address
        </label>
        <input
          type="text"
          value={recoveryAddress}
          onChange={(e) => setRecoveryAddress(e.target.value)}
          placeholder="0x..."
          className="w-full border rounded-md p-2 mb-4"
        />

        <button
          onClick={handleSetRecovery}
          disabled={isSubmitting || !recoveryAddress}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Setting..." : "Set Recovery Address"}
        </button>
      </div>
    </div>
  );
}
