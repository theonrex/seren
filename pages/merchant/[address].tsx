import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { NETWORK } from "../../payment/test/ptbs/utils";
import MerchantSlug from "@/components/merchant/merchantSlug";
import { PaymentClient } from "../../payment/src/payment-client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import ConnectWallet from "@/components/connectWallet";

interface AccountDetailPageProps {
  address?: string;
}

const AccountDetailPage = ({ address }: AccountDetailPageProps) => {
  const router = useRouter();
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const accountAddress = address || (router.query.address as string);
  const account = useCurrentAccount();
  const user: string = account!?.address;

  useEffect(() => {
    if (!router.isReady || !accountAddress || !user) return;

    fetchAccountDetails();
  }, [router.isReady, accountAddress, user]);

  const fetchAccountDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      const storedAccount = localStorage.getItem("currentPaymentAccount");

      if (storedAccount) {
        const parsedAccount = JSON.parse(storedAccount);
        if (
          parsedAccount.address === accountAddress ||
          parsedAccount.id === accountAddress
        ) {
          setAccountDetails(parsedAccount);
          setIsLoading(false);
          return;
        }
      }

      const paymentClient = await PaymentClient.init(NETWORK, user);

      const userAccounts = paymentClient.getUserPaymentAccounts();
      const matchingAccount = userAccounts.find(
        (acc) => acc.id === accountAddress
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

  if (!user) {
    return <ConnectWallet />;
  }

  //accountAddress
  if (!user) {
    return <ConnectWallet />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto p-6  text-white rounded shadow border border-red-500">
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
    <div className="min-h-screen  text-white">
      <div className=" mx-auto max-w-screen-xl">
        <Head>
          <title>{accountDetails?.name || "Account Details"}</title>
          <meta name="description" content="Payment account details" />
        </Head>

        <main className=" mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Account Details</h1>
            <button
              onClick={handleGoBack}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Accounts
            </button>
          </div>

          <div className=" text-white rounded shadow border border-gray-700 p-6">
            {accountDetails ? (
              <>
                <MerchantSlug merchantAddress={accountDetails.id} />
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    {/* <h2 className="text-xl font-semibold mb-2">
                      {accountDetails.name}
                    </h2>
                    <p className="text-gray-400">
                      Account ID: {accountDetails.id}
                    </p> */}
                    {accountDetails.address && (
                      <p className="text-gray-400">
                        {/* Address: {accountDetails.address} */}
                      </p>
                    )}
                  </div>
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

export async function getServerSideProps({
  params,
}: {
  params: { address: string };
}) {
  return {
    props: {
      address: params.address,
    },
  };
}

export default AccountDetailPage;
