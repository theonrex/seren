import React, { ReactNode } from "react";
import NavbarBody from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeModeScript } from "flowbite-react";
import Head from "next/head";
import "flowbite";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Seren - Your fast and secure payment solution."
        />
        <link
          rel="icon"
          href="https://ipfs.io/ipfs/bafkreicdmvv6aaqqoeigpr2gpu6c625jnjbd6ny2zjurgcyv65lv6bljxm"
        />
        <ThemeModeScript />
        <link
          href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css"
          rel="stylesheet"
        />
      </Head>
      <Toaster position="top-right" />
      <NavbarBody />
      <main>{children}</main>
      <ToastContainer position="top-right" autoClose={5000} />{" "}
    </>
  );
}
