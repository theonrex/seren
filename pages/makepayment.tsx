import React from "react";
import Payment from "@/components/Payments/payment";
import ConnectWallet from "@/components/connectWallet";
import { useCurrentAccount } from "@mysten/dapp-kit";
export default function makepayment() {
  const account = useCurrentAccount();
  const user = account?.address;
  return <div>{user ? <Payment /> : <ConnectWallet />}</div>;
}
