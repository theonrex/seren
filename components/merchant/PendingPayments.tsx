import React from "react";
import { AiOutlinePlus, AiOutlineCopy, AiOutlineCheck } from "react-icons/ai";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ScanModal from "./scanModal";

export default function PendingPayments({
  isLoading,
  pendingPayments,
  handleCopy,
  copiedPayment,
  formatAmount,
}: any) {
  return (
    <div>
      <div className="bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">
            Pending Payments
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-2 sm:space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-800 h-12 sm:h-16 rounded-xl"
              ></div>
            ))}
          </div>
        ) : pendingPayments && Object.keys(pendingPayments).length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {Object.keys(pendingPayments).map((key) => {
              const payment = pendingPayments[key];
              const account = payment.fields?.account;
              const paymentKey = payment.fields?.key;

              const linkToCopy = `http://localhost:3000/makepayment?account=${account}&key=${paymentKey}`;

              return (
                <div
                  key={key}
                  className="bg-gray-800 rounded-xl p-3 sm:p-4 flex justify-between items-center hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-green-900/30 p-1 sm:p-2 rounded-full">
                      <AiOutlinePlus className="text-green-400 text-sm sm:text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base capitalize">
                        {payment.fields?.description || "Payment"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {payment.date || "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* HERE: grouped the three right-side items */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-green-400 font-semibold text-sm sm:text-base">
                      +{formatAmount(payment.args?.amount || 0)} SUI
                    </span>
                    <CopyToClipboard
                      text={linkToCopy}
                      onCopy={() => handleCopy(key)}
                    >
                      <button className="text-gray-400 hover:text-gray-200 transition-colors">
                        {copiedPayment === key ? (
                          <AiOutlineCheck className="text-lg text-green-500" />
                        ) : (
                          <AiOutlineCopy className="text-lg" />
                        )}
                      </button>
                    </CopyToClipboard>
                    <ScanModal link={linkToCopy} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm sm:text-base">No pending payments</p>
          </div>
        )}
      </div>
    </div>
  );
}
