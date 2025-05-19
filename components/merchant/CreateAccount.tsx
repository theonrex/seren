import React, { useEffect, useState } from "react";
import { getSuiBalance } from "@/utils/getBalance";
import { FaArrowLeft } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK } from "../../payment/test/ptbs/utils";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { toast } from "react-toastify"; // Import toast

// Firebase imports
import { db, storage } from "@/firebase"; // Import Firebase utils
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FileInterface {
  name: string;
}

export default function CreateAccount() {
  const account = useCurrentAccount();
  const user = account?.address || "";
  const [balance, setBalance] = useState<string | null>(null);
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

  const handleImageUpload = async (file: any) => {
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
      // console.log("Created Transaction:", tx);

      signAndExecuteTransaction(
        {
          transaction: await tx.toJSON(),
          chain: "sui:testnet",
        },
        {
          onSuccess: async (result) => {
            setDigest(result.digest);
            setMessage("Payment account created successfully");
            toast.success("Payment account created successfully!"); // Success toast

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

              // console.log("dataToStore", dataToStore);

              await addDoc(collection(db, "paymentAccounts"), dataToStore);
              // Reset input fields
              setShopName("");
              setUsername("");
              setProfilePicture("");

              // Show "Redirecting..." toast
              toast.success("Redirecting to merchant...");

              // Wait 10 seconds and redirect
              setTimeout(() => {
                window.location.href = "/merchant"; // Replace with your merchant URL or route
              }, 5000);
            } catch (err) {
              console.error("Error storing data in Firestore:", err);
            }
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : "Transaction failed");
            toast.error("Transaction failed. Please try again."); // Error toast
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
      toast.error("Failed to create payment account."); // Error toast
      console.error("Error creating payment account:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen container">
      <Link className="Merchant_link" href="/merchant">
        <span>
          {" "}
          <FaArrowLeft />{" "}
        </span>
        Merchant
      </Link>
      <div className="card">
        {/* Create Payment Request */}
        <div className="card-content">
          <h2 className="text-xl font-bold mb-4">Create Payment Request</h2>

          <div className="mb-8">
            <label htmlFor="shopName" className="block mb-2 font-medium">
              Account Name
            </label>
            <input
              type="text"
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
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

          {/* <div className="mb-4">
            <label htmlFor="profilePicture" className="block mb-2 font-medium">
              Profile Picture URL
            </label>
            <input
              type="text"
              id="profilePicture"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
          </div> */}

          <div className="flex justify-between mt-4">
            <button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Merchant Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
