import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ProfilePageProps {
  paymentAccount: any;
  userProfileInfo: any;
}

export default function ProfilePage({
  paymentAccount,
  userProfileInfo,
}: ProfilePageProps) {
  console.log("userProfileInfo", userProfileInfo);
  console.log("paymentAccount", paymentAccount);
  return (
    <div className="opensea-profile-container">
      <div className="banner"></div>

      <div className="profile-card">
        <div className="profile-image-wrapper">
          <Image
            className="profile-image"
            src="https://ipfs.io/ipfs/bafybeibj2cpzl3xae752fpwz445cjbhujsycv7lzgralz5vibtp6dftbmu/1.png"
            alt="profile"
            width={120}
            height={120}
          />
        </div>

        <div className="profile-details">
          <h1 className="profile-username">
            {paymentAccount?.username || "Unnamed"}
          </h1>
          <p className="profile-address">
            Total Merchant Accounts: {userProfileInfo?.length || "0"}
          </p>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title"> Merchants Account</h2>
        <div className="">
          {!userProfileInfo ? (
            <div className="user-info-grid">
              {userProfileInfo?.map(
                (
                  user: {
                    name: string;
                    id: string | number;
                  },
                  index: React.Key | null | undefined
                ) => (
                  <Link
                    key={index}
                    href={`/profile/${user.id}`}
                    className="user-card-link"
                  >
                    <div className="user-card">
                      <p className="user-name">{user.name}</p>
                      <p className="user-id">{user.id}</p>
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="Merchant_Link">
              <Link href="/merchant/create">Create Merchant Account</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
