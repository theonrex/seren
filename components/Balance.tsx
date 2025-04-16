import { useEffect, useState } from "react";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { getSuiBalance } from "@/utils/getBalance";
import {
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaPaperPlane,
} from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";

export default function Balance() {
  const { user, isLoading } = useZkLoginSession();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const address = user?.wallet;
    if (!address) return;

    getSuiBalance(address).then(setBalance).catch(console.error);
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full border-t-4 border-b-4 border-white h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Wallet Address */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
            <p className="text-md font-mono bg-gray-800 p-2 rounded-lg inline-block break-words">
              {user?.wallet || "Not logged in"}
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-md">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold">
              {balance !== null ? `${balance} SUI` : "Loading..."}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer">
            <FaArrowDown className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Deposit</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer">
            <FaArrowUp className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Withdraw</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer">
            <FaMoneyBillWave className="text-2xl mx-auto mb-2" />
            <span className="text-sm">Earn</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Pending</h3>
              <a href="#" className="text-blue-400 text-sm hover:underline">
                See All
              </a>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-xl p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <AiOutlinePlus className="text-green-500 text-xl" />
                    <div>
                      <p className="text-sm">Payment from Julien...</p>
                      <p className="text-xs text-gray-400">
                        12.03.2025 - 14:02:34
                      </p>
                    </div>
                  </div>
                  <span className="text-green-400 font-semibold">
                    +$1233.23
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History Section */}
          <div>
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
                      <p className="text-xs text-gray-400">
                        12.03.2025 - 14:02:34
                      </p>
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
      </div>
    </div>
  );
}
