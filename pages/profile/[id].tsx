import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";

import UserProfileDetailSlug from "@/components/Profile/profileSlug";
// import "./ProfilePage.css

export default function UserProfileDetail() {
  const router = useRouter();

  return (
    <div className="opensea-profile-container">
      <button className="back-btn" onClick={() => router.push("/profile")}>
        <FaArrowLeft /> Back
      </button>

      <div className="banner"></div>

      <UserProfileDetailSlug />
    </div>
  );
}
