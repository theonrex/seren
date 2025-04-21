import React, { useState } from "react";
import Balance from "../Balance";
import {
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaPaperPlane,
} from "react-icons/fa";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { makePayment } from "@/utils/paymentUtils";

export default function ClientPage() {
  const [openModal, setOpenModal] = useState(false);
  const [tip, setTip] = useState("0");
  const [paymentId, setPaymentId] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handlePayment = async () => {
    console.log("📝 Payment attempt initiated");
    console.log("📦 Payment ID:", paymentId);
    console.log("💸 Tip (MIST):", tip);

    if (!paymentId || !tip) {
      setStatus("❌ Please enter a valid Payment ID and Tip.");
      return;
    }

    try {
      setStatus("⏳ Processing payment...");
      const data = await makePayment(paymentId, BigInt(tip));
      console.log("✅ Payment Success:", data);

      setStatus(`✅ Paid ${data.paidAmount} with Tip ${data.tipAmount}`);
    } catch (err) {
      console.error("❌ Payment Error:", err);
      setStatus("❌ Payment failed.");
    }
  };

  return (
    <div className="p-4">
      <Balance />
      <Button onClick={() => setOpenModal(true)}>Make Payment</Button>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>Make Payment</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white">Payment ID</label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                className="w-full rounded bg-gray-700 text-white px-3 py-2"
                placeholder="Enter Payment ID"
              />
            </div>
            <div>
              <label className="block text-sm text-white">Tip (in MIST)</label>
              <input
                type="number"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="w-full rounded bg-gray-700 text-white px-3 py-2"
                placeholder="Enter optional tip"
              />
            </div>
            {status && (
              <p className="mt-2 text-sm text-center text-gray-400">{status}</p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handlePayment}>Pay</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* History Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">History</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i, idx) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                {idx === 2 ? (
                  <FaPaperPlane className="text-red-500 text-xl" />
                ) : (
                  <FaPaperPlane className="text-blue-400 text-xl" />
                )}
                <div>
                  <p className="text-sm">To julien.sui</p>
                  <p className="text-xs text-gray-400">12.03.2025 - 14:02:34</p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  idx === 2 ? "text-red-400" : "text-green-400"
                }`}
              >
                {idx === 2 ? "-$1233.23" : "+$1233.23"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
