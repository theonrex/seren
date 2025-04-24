import ClientPage from "@/components/Client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import ConnectWallet from "@/components/connectWallet";

// This is a publically accessible page, displaying optional contents for signed-in users.
export default function Index() {
  const account = useCurrentAccount();

  if (account) {
    // Signed-in experience.
    return (
      <div className=" mx-auto max-w-screen-xl">
        <div>
          <ClientPage />
          {/* <FetchAccount /> */}
        </div>
      </div>
    );
  } else {
    // Anonymous experience.
    return (
      <div>
        <ConnectWallet />
      </div>
    );
  }
}
