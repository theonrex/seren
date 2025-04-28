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
import SetRecovery from "./setRecovery";
import SetOwner from "./setOwner";
import Link from "next/link";
// import "./ProfilePage.css

export default function UserProfileDetailSlug() {
  const router = useRouter();
  const { id } = router.query;
  const [copied, setCopied] = useState(false);

  const userId = typeof id === "string" ? id : id?.[0] ?? "";

  // console.log("name", name);
  console.log("id", id);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [paymentClient, setPaymentClient] = useState<PaymentClient | null>(
    null
  );
  const [paymentAccount, setPaymentAccount] = useState<any>(null);
  const [ownedObjects, setOwnedObjects] = useState<any>([]);
  const [loading, setLoading] = useState(false);
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
    navigator.clipboard.writeText(userId);
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

      <div className="profile-section">
        {loading && <p>Loading...</p>}

        <ul className="profile-links-list">
          <li className="profile-link-item">
            {" "}
            <div className="profile_div">
              <span> Shop Name</span>
              <span className="profile_link_span">
                {paymentAccount?.metadata?.find((m: any) => m.key === "name")
                  ?.value || "N/A"}
                {/* <FaChevronRight className="chevron-icon" /> */}
              </span>
            </div>
          </li>{" "}
          <li className="profile-link-item">
            {" "}
            <div className="">
              <Link href="/profile/recovery">
                <div
                  className="profile_div"
                  data-modal-target="static-modal"
                  data-modal-toggle="static-modal"
                >
                  <span>Set Recovery Address</span>
                  {/*               <span className="profile_link_span">
                   */}
                  <div className="profile_link_span">
                    <button
                      data-modal-target="static-modal"
                      data-modal-toggle="static-modal"
                      // className="block text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      type="button"
                    >
                      <FaChevronRight className="chevron-icon" />
                    </button>
                  </div>
                </div>{" "}
              </Link>
              <span></span>
            </div>
          </li>{" "}
          <li className="profile-link-item">
            <div className="">
              <Link href="/profile/setowner">
                <div
                  className="profile_div"
                  data-modal-target="static-modal"
                  data-modal-toggle="static-modal"
                >
                  <span>Set Owner Address</span>
                  {/*               <span className="profile_link_span">
                   */}
                  <div className="profile_link_span">
                    <button
                      data-modal-target="static-modal"
                      data-modal-toggle="static-modal"
                      // className="block text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      type="button"
                    >
                      <FaChevronRight className="chevron-icon" />
                    </button>
                  </div>
                </div>{" "}
              </Link>
              <span></span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
