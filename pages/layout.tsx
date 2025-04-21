import React, { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeModeScript } from "flowbite-react";
import Head from "next/head";
import "flowbite";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <ThemeModeScript />
        <link
          href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css"
          rel="stylesheet"
        />
      </Head>

      <Toaster position="top-right" />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
