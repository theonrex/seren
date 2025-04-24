import React, { useEffect, useState } from "react";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { getSuiBalance } from "@/utils/getBalance";
import {
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaPaperPlane,
} from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK } from "../../payment/test/ptbs/utils";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";

// Firebase imports
import { db, storage } from "@/firebase"; // Import Firebase utils
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function MerchantSlug() {
  const account = useCurrentAccount();
  const user = account?.address;
  const [balance, setBalance] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  const [amount, setAmount] = useState("0");
  const [generatedPayId, setGeneratedPayId] = useState("");
  const [shopName, setShopName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState("");

  // Get user balance
  useEffect(() => {
    if (!user) return;
    getSuiBalance(user).then(setBalance).catch(console.error);
  }, [user]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `profile_pictures/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const tx = new Transaction();
      const paymentClient = await PaymentClient.init(NETWORK, user);

      // Create the payment account and log the transaction
      paymentClient.createPaymentAccount(tx, shopName, {
        username: username,
        profilePicture: profilePicture,
      });

      // Log the transaction object before executing it
      console.log("Created Transaction:", tx);

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: "sui:testnet",
        },
        {
          onSuccess: async (result) => {
            setDigest(result.digest);
            setMessage("Payment account created successfully");
            console.log("Transaction result:", result);

            // Store data in Firestore
            try {
              const dataToStore = {
                userAddress: user,
                shopName,
                username,
                profilePicture,
                transactionDigest: result.digest,
                // transaction: result,
              };

              // If profile picture URL is provided, upload it to Firebase Storage
              if (profilePicture && profilePicture.startsWith("data:image")) {
                const uploadedImageUrl = await handleImageUpload(
                  profilePicture
                );
                dataToStore.profilePicture = uploadedImageUrl;
              }

              await addDoc(collection(db, "paymentAccounts"), dataToStore);
              setShopName("");
              setUsername("");
              setProfilePicture("");
            } catch (err) {
              console.error("Error storing data in Firestore:", err);
            }
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : "Transaction failed");
            console.error("Transaction error:", err);
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment account"
      );
      console.error("Error creating payment account:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen container">
      <Link href="/merchant">Merchant</Link>
      <div className="card">
        {/* Wallet Address & Balance */}
        <div className="card-header">
          <div>
            <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
            <p className="text-md font-mono bg-gray-800 p-2 rounded-lg inline-block break-words">
              {user || "Not logged in"}
            </p>
          </div>
        </div>

        <div className="card-content">
          <p className="text-gray-400 text-sm mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold">
            {balance !== null ? `${balance} SUI` : "Loading..."}
          </h2>
        </div>

        {/* Create Payment Request */}
        <div className="card-content">
          <h2 className="text-xl font-bold mb-4">Create Payment Request</h2>

          <div className="mb-4">
            <label htmlFor="shopName" className="block mb-2 font-medium">
              Shop Name
            </label>
            <input
              type="text"
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="profilePicture" className="block mb-2 font-medium">
              Profile Picture URL
            </label>
            <input
              type="text"
              id="profilePicture"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={handleSubmit}>Create Merchant Account</button>
          </div>

          {generatedPayId && (
            <div className="mt-4 bg-gray-800 p-3 rounded text-sm break-words">
              <strong>Pay Link:</strong>
              <br />
              <a
                href={generatedPayId}
                className="text-blue-400 underline"
                target="_blank"
              >
                {generatedPayId}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
