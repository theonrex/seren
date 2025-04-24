import React from "react";
import CreateAccount from "@/components/merchant/CreateAccount";
import ConnectWallet from "@/components/connectWallet";
import UserProfileDetailSlug from "@/components/Profile/profileSlug";
import { useCurrentAccount } from "@mysten/dapp-kit";
export default function create() {
  const account = useCurrentAccount();
  const user = account?.address;
  return <div>{user ? <CreateAccount /> : <ConnectWallet />}</div>;
}
