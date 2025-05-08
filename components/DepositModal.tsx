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

export default function DepositModal({ copyAddress }: { copyAddress: string }) {
  const [openModal, setOpenModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div
        className="glass-panel icon-box cursor-pointer"
        onClick={() => setOpenModal(true)}
      >
        <FaArrowDown />
        <span> Deposit </span>
      </div>

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
              <QRCode value={copyAddress} size={200} />
            </div>

            {/* Address + Copy */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-mono px-3 py-1 rounded">
                {shortenAddress(copyAddress)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className="text-yellow-600 hover:text-yellow-800"
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
