import { ZkLoginSessionProvider } from "@shinami/nextjs-zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import "../styles/global.css";
import "flowbite";
import Layout from "./layout";
import { SuiClientProvider } from "@/contexts/SuiClientContext"; // adjust path as needed

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ZkLoginSessionProvider>
        {" "}
        <SuiClientProvider>
          <Layout />
          <Component {...pageProps} />
        </SuiClientProvider>
      </ZkLoginSessionProvider>
    </QueryClientProvider>
  );
}
