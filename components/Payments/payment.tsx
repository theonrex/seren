import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { useSuiClient } from "@mysten/dapp-kit";
import { toast } from "react-toastify"; // Make sure toast is installed and imported

export default function Payment() {
  const [openModal, setOpenModal] = useState(false);
  const [tip, setTip] = useState("0");
  const [paymentId, setPaymentId] = useState("");
  const [merchantAccount, setMerchantAccount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [url, setUrl] = useState(""); // New state for storing the pasted URL
  const [loading, setLoading] = useState(false); // Loading state to disable button
  const suiClient = useSuiClient();

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  // Function to extract merchantaccount and paymentId from the URL
  const handleUrlChange = (e: any) => {
    setUrl(e.target.value); // Update URL state
    try {
      const urlParams = new URLSearchParams(new URL(e.target.value).search);

      // Extract the parameters from the URL
      const extractedMerchantAccount = urlParams.get("account"); // Use 'account' as merchantaccount
      const extractedPaymentId = urlParams.get("key"); // Use 'key' as paymentId

      if (extractedMerchantAccount) {
        setMerchantAccount(extractedMerchantAccount); // Update merchantAccount state
      }
      if (extractedPaymentId) {
        setPaymentId(extractedPaymentId); // Update paymentId state
      }
    } catch (error) {
      // Handle invalid URL
      console.error("Invalid URL format:", error);
    }
  };

  // Use useEffect to auto-populate the URL input on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const extractedMerchantAccount = urlParams.get("account"); // Use 'account' as merchantaccount
    const extractedPaymentId = urlParams.get("key"); // Use 'key' as paymentId

    if (extractedMerchantAccount && extractedPaymentId) {
      setUrl(window.location.href); // Set the full URL in the input
      setMerchantAccount(extractedMerchantAccount); // Update merchantAccount state
      setPaymentId(extractedPaymentId); // Update paymentId state
    }
  }, []); // Empty dependency array to run this effect once on page load

  const handlePayment = async () => {
    if (!paymentId || !tip || !merchantAccount) {
      setStatus(
        "❌ Please enter a valid Payment ID, Tip, and Merchant Account."
      );
      toast.error("❌ Please enter all fields!");
      return;
    }

    if (!account) {
      setStatus("❌ No wallet connected.");
      toast.error("❌ No wallet connected.");
      return;
    }

    try {
      setLoading(true); // Set loading to true when payment is processing
      setStatus("⏳ Processing payment...");

      const paymentClient = await PaymentClient.init(
        NETWORK,
        account?.address,
        merchantAccount
      );

      const tx = new Transaction();

      tx.setSender(account.address);
      // Optional: let the wallet set gas
      await paymentClient.makePayment(tx, paymentId, BigInt(tip));

      // Pass the suiClient to the toJSON method
      // const txnBytes = await tx.build({ client: suiClient });
      const txnJSON = await tx.toJSON();

      const result = await signAndExecuteTransaction({
        transaction: txnJSON,
        chain: "sui:testnet", // or "sui:mainnet"
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      const transactionBlock = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      const txStatus = transactionBlock.effects?.status?.status;
      if (txStatus !== "success") {
        setStatus("❌ Payment failed.");
        toast.error("❌ Payment failed.");
        setLoading(false);
        return;
      }

      const data = transactionBlock.events?.[0]?.parsedJson as any;
      setStatus(`✅ Paid ${data.amount} with Tip ${data.tip}`);
      toast.success(
        `✅ Payment Success! Paid ${data.amount} with Tip ${data.tip}`
      );
      setLoading(false); // Set loading to false after success
    } catch (err) {
      console.error("Payment error:", err); // Always log the full error

      let errorMessage = "❌ Payment failed.";

      if (err instanceof Error) {
        if (
          err.message.includes("referenced transaction") ||
          err.message.includes("not found")
        ) {
          errorMessage = "❌ Payment ID not found. ";
        } else {
          errorMessage = `❌ Payment failed: ${err.message}`;
        }
      }

      setStatus(errorMessage);
      toast.error(errorMessage);
      setLoading(false); // Set loading to false if there's an error
    }
  };

  return (
    <div className="payment-container">
      <div className="make-payment">Make Payment</div>

      <div className="payment-form">
        <div className="form-body">
          <div className="input-group">
            <label className="input-label">Paste Link</label>
            <input
              type="text"
              value={url}
              onChange={handleUrlChange} // Handle link change
              className="input-field"
              placeholder="Paste the payment link here"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Tip Merchanet</label>
            <input
              type="number"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="input-field"
              placeholder="Enter optional tip"
            />
          </div>
          {status && <p className="status-message">{status}</p>}
        </div>
        <div className="pay-btn-container">
          <Button
            onClick={handlePayment}
            className="pay-btn"
            disabled={loading || !paymentId || !merchantAccount} // Disable when loading or fields are empty
          >
            {loading ? "Processing..." : "Pay"}
          </Button>
        </div>
      </div>
    </div>
  );
}
