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
          content="Swoop - Your fast and secure payment solution."
        />
        <link rel="icon" href="/images/favicon.ico" />
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
