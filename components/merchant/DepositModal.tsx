import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { FaArrowDown, FaRegCopy } from "react-icons/fa";
import QRCode from "react-qr-code";

// Utility function to shorten address
const shortenAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

export default function DepositModal({
  merchantAddress,
}: {
  merchantAddress: string;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(merchantAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div
        onClick={() => setOpenModal(true)}
        className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center"
      >
        <FaArrowDown className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
        <span className="text-xs sm:text-sm">Deposit</span>
      </div>{" "}
    
      {/* <div
        className="glass-panel icon-box cursor-pointer"
        onClick={() => setOpenModal(true)}
      >
        <FaArrowDown />
        <span> Deposit </span>
      </div> */}
      <Modal
        className="modal_bg"
        dismissible
        show={openModal}
        onClose={() => setOpenModal(false)}
        size="lg"
      >
        <ModalHeader className="modal_bg"> Deposit Address</ModalHeader>
        <ModalBody className="modal_bg">
          <div className="space-y-6 text-center modal_bg">
            {/* QR Code */}
            <div className="flex justify-center">
              <QRCode value={merchantAddress} size={200} />
            </div>

            {/* Address + Copy */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-mono px-3 py-1 rounded">
                {shortenAddress(merchantAddress)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaRegCopy />
              </button>
            </div>

            {/* Feedback */}
            {copied && (
              <div className="text-green-600 text-sm font-medium">
                Copied to clipboard!
              </div>
            )}
          </div>
        </ModalBody>
        {/* 
        <ModalFooter className="modal_bg OpenModal">
          <Button onClick={() => setOpenModal(false)}>Close</Button>
        </ModalFooter> */}
      </Modal>
    </div>
  );
}
