import { db, storage } from "@/firebase"; // Import Firebase utils
import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import { FaArrowUp, FaQrcode, FaLink } from "react-icons/fa";
import QRCode from "react-qr-code";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Sui SDKs
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK } from "../../payment/test/ptbs/utils";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";

export default function IssuePaymentModal({ merchantAddress }) {
  const [openModal, setOpenModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [coinType, setCoinType] = useState("SUI");
  const [description, setDescription] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const openPaymentModal = () => {
    setOpenModal(true);
    setPaymentAmount(0);
    setPaymentId("");
  };

  const convertAmount = (amount: number, coinType: string) => {
    const decimals = coinType === "SUI" ? 9 : coinType === "USDC" ? 6 : 0;
    return BigInt(amount * 10 ** decimals);
  };

  const issuePayment = async () => {
    if (!account?.address || isIssuing || paymentAmount <= 0) return;

    setIsIssuing(true);
    try {
      const tx = new Transaction();
      const paymentClient = await PaymentClient.init(
        NETWORK,
        account?.address,
        merchantAddress
      );

      const convertedAmount = convertAmount(paymentAmount, coinType);
      const coinTypeFull =
        coinType === "SUI"
          ? "0x2::sui::SUI"
          : "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";

      paymentClient.issuePayment(
        tx,
        description,
        coinTypeFull,
        convertedAmount
      );

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: "sui:testnet", // or your preferred chain
        },
        {
          onSuccess: (result) => {
            // Log the transaction result
            console.log("Transaction Digest:", result.digest);
            console.log("Transaction Signature:", result.signature);

            const data = result?.events?.[0]?.parsedJson;
            const newPaymentId = data?.payment_id ?? "";
            console.log("Parsed Event Data:", result);
            console.log("New Payment ID:", newPaymentId);

            // Log raw effects (you can customize based on your needs)
            console.log("Raw Transaction Effects:", result.rawEffects);

            // Log the transaction bytes (not human-readable, but for reference)
            console.log("Raw Transaction Bytes:", result.bytes);

            // Store the payment data in Firebase
            addPaymentToFirebase({
              paymentId: newPaymentId,
              description,
              amount: paymentAmount,
              coinType,
              merchantAddress,
            });
          },
          onError: (err) => {
            console.error("Payment failed", err);
          },
          onSettled: () => {
            setIsIssuing(false);
          },
        }
      );
    } catch (err) {
      console.error("Error during payment:", err);
      setIsIssuing(false);
    }
  };

  // Function to save the payment details to Firebase
  const addPaymentToFirebase = async (paymentData) => {
    try {
      await addDoc(collection(db, "payments"), paymentData);
      console.log("Payment data successfully saved to Firebase!");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }
  };

  return (
    <div>
      <div
        onClick={openPaymentModal}
        // className={`bg-gray-800 p-4 rounded-xl transition cursor-pointer ${
        //   isIssuing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
        // }`}
      >
        <FaArrowUp className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
        <span className="text-xs sm:text-sm">
          {" "}
          {isIssuing ? "Issuing..." : "Issue Payment"}
        </span>
      </div>

      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        theme={{ content: { base: "bg-gray-800 text-white" } }}
        size="lg"
      >
        <ModalHeader>Issue Payment</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" value="Payment Description" />
              <TextInput
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isIssuing}
                placeholder="Enter payment description (optional)"
              />
            </div>

            <div>
              <Label htmlFor="coinType" value="Coin Type" />
              <Select
                id="coinType"
                value={coinType}
                onChange={(e) => setCoinType(e.target.value)}
                disabled={isIssuing}
              >
                <option value="SUI">SUI</option>
                <option value="USDC">USDC</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" value="Amount" />
              <TextInput
                id="amount"
                type="number"
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                disabled={isIssuing}
                placeholder="Enter amount"
              />
            </div>

            {paymentId && (
              <div className="mt-4">
                <Label value="Payment ID" />
                <div className="flex items-center space-x-2">
                  <span>{paymentId}</span>
                  <FaLink
                    className="cursor-pointer text-blue-500"
                    onClick={() => navigator.clipboard.writeText(paymentId)}
                  />
                  <FaQrcode
                    className="cursor-pointer text-blue-500"
                    onClick={() => alert("QR Code for payment ID")}
                  />
                </div>
                <QRCode value={paymentId} />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={issuePayment}
            className="bg-blue-600 hover:bg-blue-500"
            disabled={isIssuing || paymentAmount <= 0}
          >
            {isIssuing ? "Issuing..." : "Confirm Payment"}
          </Button>
          <Button
            onClick={() => setOpenModal(false)}
            className="bg-gray-700 hover:bg-gray-600"
            disabled={isIssuing}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
