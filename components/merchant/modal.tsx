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

// Importing toast
import { toast } from "react-toastify";

export default function IssuePaymentModal({ merchantAddress }: any) {
  const [openModal, setOpenModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [coinType, setCoinType] = useState<string>("SUI");
  const [description, setDescription] = useState<any>("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const openPaymentModal = () => {
    setOpenModal(true);
    setPaymentAmount(0);
    setPaymentId("");
    setDescription(""); // Clear the description
    setCoinType("SUI"); // Reset the coin type to default
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
          transaction: await tx.toJSON(),
          chain: "sui:testnet",
        },
        {
          onSuccess: (result) => {
            // Store the payment data in Firebase
            addPaymentToFirebase({
              description,
              amount: convertedAmount.toString(), // Convert BigInt to string for Firestore
              coinType: coinTypeFull,
              merchantAddress,
              transactionDigest: result.digest,
              timestamp: new Date(),
            });

            // Show success toast
            toast.success("Payment successful!");

            // Close the modal
            setOpenModal(false);

            // Clear the inputs after success
            setDescription("");
            setPaymentAmount(0);
            setCoinType("SUI");

            // Set paymentId (this can be a derived ID or payment-related ID if you want to use it later)
            setPaymentId(result.digest);
          },
          onError: (err) => {
            console.error("Payment failed", err);
            toast.error("Payment failed. Please try again.");
          },
          onSettled: () => {
            setIsIssuing(false);
          },
        }
      );
    } catch (err) {
      console.error("Error during payment:", err);
      toast.error("Error during payment processing.");
      setIsIssuing(false);
    }
  };

  // Function to save the payment details to Firebase
  const addPaymentToFirebase = async (paymentData: any) => {
    try {
      await addDoc(collection(db, "payments"), paymentData);
      // console.log("Payment data successfully saved to Firebase!");
    } catch (error) {
      console.error("Error saving data :", error);
    }
  };

  return (
    <div>
      <div onClick={openPaymentModal}>
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
        className="modal_bg"
      >
        <ModalHeader className="modal_bg">Issue Payment</ModalHeader>
        <ModalBody className="modal_bg">
          <div className="space-y-4 modal_div">
            <div>
              <Label htmlFor="description">Payment Description</Label>
              <TextInput
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isIssuing}
                placeholder="Enter payment description (optional)"
              />
            </div>

            <div>
              <Label htmlFor="coinType">Coin Type</Label>
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
                <Label htmlFor="Payment ID">Payment ID </Label>
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
        <ModalFooter className="modal_bg">
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
