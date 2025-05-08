import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiCreditCard } from "react-icons/fi";

const PaymentCard = () => {
  const handleClick = () => {
    toast.info("🚧 Feature coming soon!");
  };

  return (
    <div className=" flex items-center justify-center PaymentCard">
      <ToastContainer position="top-center" />
      <div
        onClick={handleClick}
        className=" border rounded-3xl  w-full max-w-3xl aspect-video flex flex-col items-center justify-center cursor-pointer relative group transition hover:scale-105"
      >
        {/* Top Decoration (optional) */}
        <div className=" PaymentCard_Bg absolute top-0 left-0 w-full h-6  rounded-t-3xl border-t flex items-center justify-center text-yellow-500 text-xs">
          {/* Placeholder for decorative pattern */}
        </div>

        {/* Icon and Text */}
        <div className="Card_flex">
          <FiCreditCard size={32} className="text-yellow-500 mb-2" />
          <span className="text-yellow-500 text-xl font-medium">Add Card</span>
        </div>

        {/* Decorative Corner Borders */}
        <div className="absolute border w-6 h-6 rounded-bl-3xl bottom-0 left-0"></div>
        {/* <div className="absolute border w-6 h-6 rounded-br-3xl bottom-0 right-0"></div> */}
        {/* <div className="absolute border w-6 h-6 rounded-tl-3xl top-0 left-0"></div> */}
        <div className="absolute border w-6 h-6 rounded-tr-3xl top-0 right-0"></div>
      </div>
    </div>
  );
};

export default PaymentCard;
