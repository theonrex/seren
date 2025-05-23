"use client";

import React, { useEffect, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import ProfilePage from "@/components/Profile/profilePage";
import { ConnectButton } from "@mysten/dapp-kit";
import ConnectWallet from "@/components/connectWallet";

interface AccountPreview {
  address: string;
  balance: number;
}
export default function Profile() {
  const currentAccount = useCurrentAccount();
  const account = useCurrentAccount();

  const user = account?.address;
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [paymentAccount, setPaymentAccount] = useState<any>("");
  const [ownedObjects, setOwnedObjects] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentsConfig, setPaymentsConfig] = useState(null);
  const [paymentNames, setPaymentNames] = useState(null);
  const [userProfileInfo, setUserProileInfo] = useState<any[]>([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const paymentClient = await PaymentClient.init(NETWORK, user);
        // Get all user accounts and switch
        const userAccounts = paymentClient.getUserPaymentAccounts();

        const userProfile = paymentClient.getUserProfile();

        // setPaymentsConfig(paymentConfig);
        // setPaymentNames(paymentName);
        setPaymentAccount(userProfile);
        setUserProileInfo(userAccounts);
      } catch (err) {
        console.error("Error loading payment data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [account]);

  return (
    <div className="p-4">
      {account ? (
        <div>
          <ProfilePage
            paymentAccount={paymentAccount}
            userProfileInfo={userProfileInfo}
          />
        </div>
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
}
