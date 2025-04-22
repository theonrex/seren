"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FaChevronRight, FaCopy, FaArrowLeft } from "react-icons/fa";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK } from "../../payment/test/ptbs/utils";
// import "./ProfilePage.css

export default function UserProfileDetailSlug() {
  const router = useRouter();
  const { id } = router.query;
  const [copied, setCopied] = useState(false);

  console.log("name", name);
  console.log("id", id);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [paymentClient, setPaymentClient] = useState<PaymentClient | null>(
    null
  );
  const [paymentAccount, setPaymentAccount] = useState(null);
  const [ownedObjects, setOwnedObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recoveryAddress, setRecoveryAddress] = useState("");
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  console.log("ownedObjects", ownedObjects);
  console.log("paymentAccount", paymentAccount);

  //
  const user = {
    id,
    name: "User Name Placeholder",
    image:
      "https://ipfs.io/ipfs/bafybeibj2cpzl3xae752fpwz445cjbhujsycv7lzgralz5vibtp6dftbmu/1.png",
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenedAddress = `${user.id?.slice(0, 6)}...${user.id?.slice(-4)}`;

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!currentAccount?.address) return;

      try {
        setLoading(true);

        const client = await PaymentClient.init(
          NETWORK,
          currentAccount.address,
          ACCOUNT
        );

        const userAccounts = client.getUserPaymentAccounts();
        const accountId = userAccounts.find((a) => a.id === id)?.id;

        if (accountId) {
          await client.switchAccount(accountId);
        }

        setPaymentClient(client);
        setPaymentAccount(client.paymentAccount);

        const objects = await client.getOwnedObjects();
        setOwnedObjects(objects);
      } catch (err) {
        console.error("Error loading payment data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // 🔒 Set recovery address (owner signs)
  const handleSetRecovery = async () => {
    if (!paymentClient || !recoveryAddress) return;

    try {
      const tx = new Transaction();
      paymentClient.setRecoveryAddress(tx, recoveryAddress);
      const result = await signAndExecute({ transactionBlock: tx });
      console.log("Recovery address set:", result);
    } catch (err) {
      console.error("Failed to set recovery address:", err);
    }
  };

  // 🔁 Set new owner (recovery address signs)
  const handleRecoverOwner = async () => {
    if (!paymentClient || !newOwnerAddress) return;

    try {
      const tx = new Transaction();
      paymentClient.setOwnerAddress(tx, newOwnerAddress);
      const result = await signAndExecute({ transactionBlock: tx });
      console.log("Ownership recovered:", result);
    } catch (err) {
      console.error("Failed to recover ownership:", err);
    }
  };

  const menuItems = [
    { title: "Recovery", action: handleSetRecovery },
    { title: "Transactions", action: () => alert("Transactions!") },
    { title: "Security", action: () => alert("Security!") },
  ];

  return (
    <div className="">
      <div className="profile-card">
        <div className="profile-image-wrapper">
          <Image
            className="profile-image"
            src={user.image}
            alt="User"
            width={120}
            height={120}
          />
        </div>

        <div className="profile-details">
          {/* <h1 className="profile-username">{user.name}</h1> */}
          <p className="profile-address">
            {shortenedAddress}
            <FaCopy
              className="copy-icon"
              onClick={copyToClipboard}
              title="Copy address"
            />
            {copied && <span className="copy-feedback">Copied!</span>}
          </p>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {/* {paymentAccount && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Account</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(paymentAccount, null, 2)}
          </pre>
        </div>
      )} */}

      {/* {ownedObjects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Owned Objects</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(ownedObjects, null, 2)}
          </pre>
        </div>
      )} */}

      <div className="profile-section">
        <ul className="profile-links-list">
          {paymentAccount?.metadata?.find((m: any) => m.key === "name")
            ?.value || "N/A"}
          {menuItems.map((item, i) => (
            <li key={i} className="profile-link-item">
              <button onClick={item.action}>
                <span>{item.title}</span>
                <FaChevronRight className="chevron-icon" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
