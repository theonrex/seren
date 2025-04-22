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

export default function Profile() {
  const currentAccount = useCurrentAccount();
  const account = useCurrentAccount();

  const ACCOUNT =
    "0x21aa14a1466461b3096ca43420f38d8c6002e01684dcb9f28feb0eb5c99912ae";

  const user = account?.address;
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [paymentAccount, setPaymentAccount] = useState(null);
  const [ownedObjects, setOwnedObjects] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentsConfig, setPaymentsConfig] = useState(null);
  const [paymentNames, setPaymentNames] = useState(null);
  const [userProfileInfo, setUserProileInfo] = useState(null);

  //   console.log("testKeypair", testKeypair.toSuiAddress());
  //   console.log("user", user);
  console.log("paymentAccount", paymentAccount);
  //   console.log("ownedObjects", ownedObjects);
  console.log("userProfileInfo", userProfileInfo);
  //   console.log("paymentNames", paymentNames);
  //   console.log("paymentsConfig", paymentsConfig);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const paymentClient = await PaymentClient.init(NETWORK, user);
        // const paymentClients = await PaymentClient.init(NETWORK, user, ACCOUNT);

        // Get all user accounts and switch
        const userAccounts = paymentClient.getUserPaymentAccounts();
        // const paymentConfig = paymentClient.getPaymentAccountConfig();
        // const paymentName = paymentClients.getPaymentAccountName();
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
  //   useEffect(() => {
  //     const fetchPaymentData = async () => {
  //       if (!user) return;

  //       try {
  //         setLoading(true);

  //         const paymentClients = await PaymentClient.init(NETWORK, user, ACCOUNT);

  //         const objects = paymentClients.getOwnedObjects();
  //         setOwnedObjects(objects);
  //       } catch (err) {
  //         console.error("Error loading payment data:", err);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchPaymentData();
  //   }, [account]);

  return (
    <div className="p-4">
      <ProfilePage
        paymentAccount={paymentAccount}
        userProfileInfo={userProfileInfo}
      />
    </div>
  );
}
