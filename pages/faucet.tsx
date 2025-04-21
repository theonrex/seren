import { useState } from "react";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import toast from "react-hot-toast";

export default function FaucetPage() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const walletAddress = account?.address ?? "";
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequest = async () => {
    if (!walletAddress) return;

    setErrorMessage("");
    const toastId = toast.loading("Requesting SUI...");
    setLoading(true);

    try {
      await requestSuiFromFaucetV0({
        host: getFaucetHost("testnet"),
        recipient: walletAddress,
      });

      toast.success("✅ SUI requested successfully!", { id: toastId });
    } catch (error: any) {
      toast.error("❌ Faucet request failed.", { id: toastId });
      setErrorMessage(
        "Faucet request failed. You can also try requesting from the official faucet:"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="bg-[#111] p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          🧪 Sui Faucet (Testnet)
        </h1>

        {!account?.address ? (
          <p className="text-center text-gray-400">Loading wallet...</p>
        ) : !walletAddress ? (
          <p className="text-center text-red-400">No connected wallet found.</p>
        ) : (
          <>
            <label className="text-sm mb-2 block">
              Connected Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              disabled
              className="w-full p-3 border border-gray-700 bg-black text-white rounded-lg mb-4"
            />
            <button
              onClick={handleRequest}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-gray-700 cursor-not-allowed text-gray-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Requesting..." : "Request SUI to Wallet"}
            </button>
          </>
        )}

        {/* Error Message on Page */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg text-sm text-red-300">
            <p>{errorMessage}</p>
            <a
              href="https://faucet.testnet.sui.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 inline-block mt-1"
            >
              https://faucet.testnet.sui.io/
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
