import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import ConnectWallet from "@/components/connectWallet";
import UserProfileDetailSlug from "@/components/Profile/profileSlug";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function UserProfileDetail() {
  const router = useRouter();
  const account = useCurrentAccount();
  const user = account?.address;

  return (
    <div>
      {user ? (
        <div className="opensea-profile-container">
          <button className="back-btn" onClick={() => router.push("/profile")}>
            <FaArrowLeft /> Back
          </button>

          <div className="banner"></div>

          <UserProfileDetailSlug />
        </div>
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
}
