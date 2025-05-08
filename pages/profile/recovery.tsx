import React from "react";
import SetRecovery from "@/components/Profile/setRecovery";
import { useCurrentAccount } from "@mysten/dapp-kit";
import ConnectWallet from "@/components/connectWallet";

export default function recovery() {
  const account = useCurrentAccount();
  const user = account?.address;
  return <div>{user ? <SetRecovery /> : <ConnectWallet />}</div>;
}
