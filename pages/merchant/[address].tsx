// pages/account/[address].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
// import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import MerchantSlug from "@/components/merchant/merchantSlug";
import { Transaction } from "@mysten/sui/transactions";
import { PaymentClient } from "../../payment/src/payment-client";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
interface AccountDetailPageProps {
  address?: string;
}

const AccountDetailPage = ({ address }: AccountDetailPageProps) => {
  const router = useRouter();
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the address from the router if not provided as a prop
  const accountAddress = address || (router.query.address as string);
  const account = useCurrentAccount();

  const user = account?.address;
  useEffect(() => {
    // Don't fetch until the router is ready and we have an address
    if (!router.isReady || !accountAddress) return;

    fetchAccountDetails();
  }, [router.isReady, accountAddress]);

  const fetchAccountDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      // First try to get the account from localStorage (if available)
      const storedAccount = localStorage.getItem("currentPaymentAccount");
      if (storedAccount) {
        const parsedAccount = JSON.parse(storedAccount);

        // Check if this is the correct account (matching address)
        if (
          parsedAccount.address === accountAddress ||
          parsedAccount.id === accountAddress
        ) {
          setAccountDetails(parsedAccount);
          setIsLoading(false);
          return;
        }
      }

      // If not found in localStorage or doesn't match, fetch from API
      const paymentClient = await PaymentClient.init(NETWORK, user);

      // Get all accounts and find the one matching the address
      const userAccounts = paymentClient.getUserPaymentAccounts();
      const matchingAccount = userAccounts.find(
        (account) =>
          account.id === accountAddress || account.id === accountAddress
      );

      if (matchingAccount) {
        await paymentClient.switchAccount(matchingAccount.id);
        setAccountDetails(paymentClient.paymentAccount);
      } else {
        throw new Error("Account not found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load account details"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push("/merchant");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto p-6 bg-black text-white rounded shadow border border-red-500">
            <h2 className="text-xl font-semibold mb-4">Error</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleGoBack}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>{accountDetails?.name || "Account Details"}</title>
          <meta name="description" content="Payment account details" />
        </Head>

        <main className="max-w-3xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Account Details</h1>
            <button
              onClick={handleGoBack}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Accounts
            </button>
          </div>

          <div className="bg-black text-white rounded shadow border border-gray-700 p-6">
            {accountDetails ? (
              <>
                <MerchantSlug merchantAddress={accountDetails.id} />
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {accountDetails.name}
                    </h2>
                    <p className="text-gray-400">
                      Account ID: {accountDetails.id}
                    </p>
                    {accountDetails.address && (
                      <p className="text-gray-400">
                        {/* Address: {accountDetails.address} */}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Account Details</h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(accountDetails, null, 2)}
                  </pre>
                </div>

                {/* Additional account actions can be added here */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
                    View Transactions
                  </button>
                  <button className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700">
                    Account Settings
                  </button>
                </div>
              </>
            ) : (
              <p>No account details available</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// You can also use getServerSideProps to fetch the account data server-side
export async function getServerSideProps({
  params,
}: {
  params: { address: string };
}) {
  // If you want to pre-fetch the data server-side, you can do so here
  // For client-side only rendering, just return the address
  return {
    props: {
      address: params.address,
    },
  };
}

export default AccountDetailPage;

// Use getServerSideProps instead of getStaticPaths/getStaticProps
// export async function getServerSideProps({ params }) {
//     // The ID is passed as a parameter
//     const { id } = params;

//     return {
//       props: {
//         id, // Pass the ID to the component as a prop
//       },
//     };
//   }
