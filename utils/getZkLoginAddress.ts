import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";

// Utility function to get wallet address from the zkLogin session
export const getZkLoginWalletAddress = () => {
  const { user, isLoading } = useZkLoginSession();

  // Ensures the session is loaded and user is available
  if (isLoading) {
    return null; // Can show loading indicator in UI instead
  }

  return user?.wallet ?? null;
};
