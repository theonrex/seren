import React from "react";
import SetOwner from "@/components/Profile/setOwner";
import ConnectWallet from "@/components/connectWallet";
import { useCurrentAccount } from "@mysten/dapp-kit";
export default function setowner() {
  const account = useCurrentAccount();
  const user = account?.address;
  return <div>{user ? <SetOwner /> : <ConnectWallet />}</div>;
}
