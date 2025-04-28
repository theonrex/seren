import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from "flowbite-react";
import QRCode from "react-qr-code";
import { FaArrowUp } from "react-icons/fa";

export default function ScanModal({ link }: any) {
  const [openModal, setOpenModal] = useState(false);

  const openPaymentModal = () => {
    setOpenModal(true);
  };

  return (
    <div>
      <div onClick={openPaymentModal}>
        <FaArrowUp className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
        <span className="text-xs sm:text-sm">Scan to pay</span>
      </div>

      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        theme={{ content: { base: "bg-gray-800 text-white" } }}
        size="lg"
        className="modal_bg"
      >
        <ModalHeader className="modal_bg">Scan To Pay</ModalHeader>
        <ModalBody className="modal_bg">
          <div className="space-y-4 modal_div">
            {/* Display QR Code here */}
            <QRCode value={link} size={256} />
          </div>
        </ModalBody>
        <ModalFooter className="modal_bg">
          <Button
            onClick={() => setOpenModal(false)}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
