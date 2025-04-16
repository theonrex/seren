import React from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export default function Layout() {
  return (
    <div>
      <Toaster position="top-right" />

      <Navbar />
    </div>
  );
}
