import React, { createContext, useContext } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Create a client connected to testnet
const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

const SuiClientContext = createContext<SuiClient | null>(null);

export const SuiClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <SuiClientContext.Provider value={suiClient}>
    {children}
  </SuiClientContext.Provider>
);

export const useSuiClient = () => {
  const context = useContext(SuiClientContext);
  if (!context)
    throw new Error("useSuiClient must be used within a SuiClientProvider");
  return context;
};
