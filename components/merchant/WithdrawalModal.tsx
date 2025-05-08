import React, { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { FaArrowUp, FaWallet, FaCheck, FaTimes } from "react-icons/fa";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NETWORK = "testnet"; // or "mainnet" / "devnet"
const USDC_TOKEN_ADDRESS =
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";

export default function WithdrawModal({ merchantAddress }: any) {
  const user: string = merchantAddress;
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [openModal, setOpenModal] = useState(false);
  const [suiBalance, setSuiBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("SUI");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [txDigest, setTxDigest] = useState("");
  const [maxSelected, setMaxSelected] = useState(false);
  const account = user;
  const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

  useEffect(() => {
    if (!user) return;
    const fetchBalances = async () => {
      try {
        const coins = await client.getAllBalances({ owner: user });
        const sui = coins.find((c) => c.coinType === "0x2::sui::SUI");
        const usdc = coins.find((c) => c.coinType === USDC_TOKEN_ADDRESS);
        setSuiBalance((Number(sui?.totalBalance || "0") / 1e9).toString()); // convert to SUI from mist
        setUsdcBalance((Number(usdc?.totalBalance || "0") / 1e6).toString()); // USDC uses 6 decimals
      } catch (err) {
        console.error("Failed to fetch balances", err);
        toast.error("Failed to fetch balances");
      }
    };
    fetchBalances();
  }, [user, openModal]); // Refresh balances when modal opens

  const handleTokenChange = (selected: React.SetStateAction<string>) => {
    setToken(selected);
    setAmount("");
    setError("");
    setMaxSelected(false);
  };

  const handleMaxClick = () => {
    if (token === "SUI") {
      const buffer = 0.01; // reserve for gas
      const maxAmount = Math.max(parseFloat(suiBalance) - buffer, 0).toFixed(6);
      setAmount(maxAmount);
    } else {
      setAmount(usdcBalance);
    }
    setMaxSelected(true);
  };

  const resetForm = () => {
    setAmount("");
    setRecipient("");
    setError("");
    setSuccess(false);
    setTxDigest("");
    setMaxSelected(false);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    resetForm();
    setLoading(false);
  };

  const handleWithdraw = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    // Input validation
    if (!recipient || recipient.trim() === "") {
      setError("Please enter a valid recipient address");
      toast.error("Please enter a valid recipient address");
      setLoading(false);
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      toast.error("Please enter a valid amount");
      setLoading(false);
      return;
    }

    // Balance validation
    const numAmount = Number(amount);
    if (token === "SUI" && numAmount >= Number(suiBalance)) {
      setError("Insufficient SUI balance (need to leave some for gas)");
      toast.error("Insufficient SUI balance");
      setLoading(false);
      return;
    } else if (token === "USDC" && numAmount > Number(usdcBalance)) {
      setError("Insufficient USDC balance");
      toast.error("Insufficient USDC balance");
      setLoading(false);
      return;
    }

    try {
      const tx = new Transaction();

      // Handle token transfer (SUI or USDC)
      if (token === "SUI") {
        const mistAmount = BigInt((Number(amount) * 1e9).toFixed(0));
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(mistAmount)]);
        tx.transferObjects([coin], tx.pure.address(recipient));
      } else {
        const coins = await client.getCoins({
          owner: user,
          coinType: USDC_TOKEN_ADDRESS,
        });

        if (!coins.data.length) {
          setError("No USDC tokens available to withdraw");
          toast.error("No USDC tokens available to withdraw");
          setLoading(false);
          return;
        }

        const coinInput = tx.makeMoveVec({
          elements: coins.data.map((c) => tx.object(c.coinObjectId)),
        });

        const usdcAmount = BigInt((Number(amount) * 1e6).toFixed(0));
        const [coin] = tx.splitCoins(coinInput, [tx.pure.u64(usdcAmount)]);
        tx.transferObjects([coin], tx.pure.address(recipient));
      }

      const txnJSON = await tx.toJSON();

      // Using the `useCurrentAccount` hook to get the user's current account
      if (!account) {
        toast.error("Please connect your wallet");
        setError("Please connect your wallet");
        setLoading(false);
        return;
      }

      toast.info("Please confirm the transaction in your wallet...");

      try {
        // Sign and execute the transaction - improved error handling
        signAndExecuteTransaction(
          {
            transaction: txnJSON,
            // sender: account,
          },
          {
            onSuccess: async (response) => {
              if (!response) {
                throw new Error("No response received from transaction");
              }

              const digestValue = response.digest;
              if (!digestValue) {
                throw new Error("Transaction submitted but no digest received");
              }

              setTxDigest(digestValue);
              toast.info("Transaction submitted, waiting for confirmation...");

              try {
                await client.waitForTransaction({
                  digest: digestValue,
                  options: {
                    showEffects: true,
                    showEvents: true,
                  },
                });

                const transactionBlock = await client.getTransactionBlock({
                  digest: digestValue,
                  options: {
                    showEffects: true,
                    showEvents: true,
                  },
                });

                const txStatus = transactionBlock.effects?.status?.status;

                if (txStatus !== "success") {
                  setError(`Transaction failed: ${txStatus}`);
                  toast.error(`Transaction failed: ${txStatus}`);
                  setLoading(false);
                } else {
                  setSuccess(true);
                  toast.success(`${token} transfer successful!`);
                  setLoading(false);

                  // Refresh balances after successful transaction
                  const fetchBalances = async () => {
                    try {
                      const coins = await client.getAllBalances({
                        owner: user,
                      });
                      const sui = coins.find(
                        (c) => c.coinType === "0x2::sui::SUI"
                      );
                      const usdc = coins.find(
                        (c) => c.coinType === USDC_TOKEN_ADDRESS
                      );
                      setSuiBalance(
                        (Number(sui?.totalBalance || "0") / 1e9).toString()
                      );
                      setUsdcBalance(
                        (Number(usdc?.totalBalance || "0") / 1e6).toString()
                      );
                    } catch (err) {
                      console.error("Failed to refresh balances", err);
                    }
                  };

                  fetchBalances();

                  setTimeout(() => {
                    resetForm();
                  }, 5000);
                }
              } catch (waitError) {
                console.error("Error waiting for transaction:", waitError);
                setError(
                  "Error confirming transaction. Please check explorer."
                );
                toast.error(
                  "Error confirming transaction. Please check explorer."
                );
              }
            },
            onError: (txError) => {
              console.error("Transaction error:", txError);
              setError(
                txError.message || "Transaction failed. Please try again."
              );
              toast.error(
                txError.message || "Transaction failed. Please try again."
              );
              setLoading(false);
            },
          }
        );
      } catch (signError) {
        const err = signError as Error;
        console.error("Signing error:", err);
        setError(err.message || "Failed to sign transaction");
        toast.error(err.message || "Failed to sign transaction");
        setLoading(false);
      }
    } catch (err) {
      const error = err as Error;

      console.error("Transaction setup failed:", err);
      setError(
        error.message || "Failed to set up transaction. Please try again."
      );
      toast.error(
        error.message || "Failed to set up transaction. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => setOpenModal(true)}
        className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center"
      >
        <FaArrowUp className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-yellow-400" />
        <span className="text-xs sm:text-sm">Withdraw</span>
      </div>{" "}
      <Modal
        className="modal_bg"
        // dismissible
        show={openModal}
        onClose={handleModalClose}
        size="lg"
      >
        <ModalHeader className="modal_bg border-b border-gray-700">
          <div className="flex items-center">
            <FaArrowUp className="text-sm" />
            <span>Withdraw Funds</span>
          </div>
        </ModalHeader>
        <ModalBody className="modal_bg">
          <div className="space-y-6 text-left">
            {/* Wallet Balance Display */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-gray-400">
                  <FaWallet className="mr-2" />
                  <span>Available Balance</span>
                </div>
                <div className="flex gap-4">
                  <div className="text-sm text-gray-400">SUI: {suiBalance}</div>
                  <div className="text-sm text-gray-400">
                    USDC: {usdcBalance}
                  </div>
                </div>
              </div>
            </div>

            {/* Token Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Select Token
              </label>
              <div className="flex gap-2">
                {["SUI", "USDC"].map((t) => (
                  <button
                    key={t}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center flex-1 ${
                      token === t
                        ? "bg-yellow-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => handleTokenChange(t)}
                  >
                    <span className="font-medium">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                placeholder="0x..."
              />
            </div>

            {/* Amount with MAX button */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Amount
                </label>
                <div className="text-sm text-gray-400">
                  Selected Balance: {token === "SUI" ? suiBalance : usdcBalance}{" "}
                  {token}
                </div>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setMaxSelected(false);
                  }}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none pr-16"
                  placeholder="0.0"
                  step="0.0001"
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className={`absolute right-2 py-1 px-2 text-xs rounded ${
                    maxSelected
                      ? "bg-yellow-600"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                >
                  MAX
                </button>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                {token === "SUI"
                  ? "Note: A small amount of SUI will be reserved for gas fees"
                  : ""}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-900 bg-opacity-30 border border-green-800 text-green-400 p-3 rounded-lg text-sm flex items-center">
                <FaCheck className="mr-2" />
                Transaction successful!
                {txDigest && (
                  <a
                    href={`https://explorer.sui.io/txblock/${txDigest}?network=${NETWORK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline hover:text-green-300"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-400 p-3 rounded-lg text-sm flex items-center">
                <FaTimes className="mr-2" />
                {error}
              </div>
            )}

            {/* Withdraw Button */}
            <div>
              <Button
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaArrowUp className="mr-2" />
                    Withdraw {token}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
