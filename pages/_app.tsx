import { ZkLoginSessionProvider } from "@shinami/nextjs-zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import "../styles/global.css";
import "flowbite";
import Layout from "./layout";
// import { SuiClientProvider } from "@/contexts/SuiClientContext"; // adjust path as needed
import "../styles/main.css"
import "@mysten/dapp-kit/dist/index.css";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  const networks = {
    testnet: { url: getFullnodeUrl("testnet") },
    // devnet: { url: getFullnodeUrl("devnet") },
    // mainnet: { url: getFullnodeUrl("mainnet") },
  };
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ZkLoginSessionProvider>
        {" "}
        <SuiClientProvider> */}
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        {" "}
        <WalletProvider autoConnect>
          <Layout>
            <Component {...pageProps} />
            <script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js"></script>
          </Layout>
        </WalletProvider>
      </SuiClientProvider>
      {/* </SuiClientProvider>
      </ZkLoginSessionProvider> */}
    </QueryClientProvider>
  );
}
