import React, { useState } from "react";
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
// Sui Payment Setup
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import QRCode from "react-qr-code"; // Assuming you're using a QR code generator

export default function IssuePaymentModal({ accountDetails }) {
  console.log("data", NETWORK, testKeypair.toSuiAddress(), ACCOUNT);
  const [openModal, setOpenModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0); // Payment amount state
  const [coinType, setCoinType] = useState("SUI"); // Coin type state
  const [description, setDescription] = useState(""); // Payment description
  const [isIssuing, setIsIssuing] = useState(false); // Track issuing status
  const [paymentId, setPaymentId] = useState(""); // Store generated payment ID

  // console.log("zkLoginUserAddress", zkLoginUserAddress);

  // Reset the modal state when opening
  const openPaymentModal = () => {
    setOpenModal(true);
    setPaymentAmount(0); // Reset payment amount on modal open
    setPaymentId(""); // Reset paymentId
  };

  // Handle amount conversion based on coin type
  const convertAmount = (amount: number, coinType: string) => {
    const decimals = coinType === "SUI" ? 9 : coinType === "USDC" ? 6 : 0;
    return BigInt(amount * 10 ** decimals);
  };

  // Issue payment function
  const issuePayment = async () => {
    if (isIssuing) return; // Prevent multiple requests
    if (paymentAmount <= 0) return; // Prevent invalid payment amount

    setIsIssuing(true);

    const paymentClient = await PaymentClient.init(
      NETWORK,
      testKeypair.toSuiAddress(),
      ACCOUNT
    );

    const tx = new Transaction();
    tx.setGasBudget(1000000000); // Gas budget

    // Convert the amount to the appropriate precision for the selected coin type
    const convertedAmount = convertAmount(paymentAmount, coinType);

    console.log("Issuing Payment with following details:");
    console.log("Description:", description);
    console.log("Coin Type:", coinType);
    console.log("Amount (converted):", convertedAmount);

    paymentClient.issuePayment(
      tx,
      description, // Description (can be optional)
      coinType === "SUI"
        ? "0x2::sui::SUI"
        : "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
      convertedAmount
    );

    try {
      const result = await paymentClient.client.signAndExecuteTransaction({
        signer: testKeypair,
        transaction: tx,
        options: { showEffects: true, showEvents: true },
        requestType: "WaitForLocalExecution",
      });

      console.log("Transaction Result:", result);

      if (result.effects?.status.status !== "success") {
        console.log("Payment failed:", result.effects?.status.error);
      } else {
        const data = result.events?.[0]?.parsedJson as any;
        const [generatedPaymentId] = [data.payment_id];
        setPaymentId(generatedPaymentId); // Set payment ID from the event data
        console.log("Payment ID:", generatedPaymentId); // Log generated payment ID
      }
    } catch (error) {
      console.error("Payment failed", error);
    }

    setIsIssuing(false); // Reset the status
  };

  return (
    <div>
      <div
        onClick={openPaymentModal}
        className={`bg-gray-800 p-4 rounded-xl transition cursor-pointer ${
          isIssuing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
        }`}
      >
        <FaArrowUp className="text-2xl mx-auto mb-2" />
        <span className="text-sm">
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
