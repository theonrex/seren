// import { PaymentClient } from "../../payment/src/payment-client";
import { Transaction } from "@mysten/sui/transactions";
// import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { PaymentClient } from "../../payment/src/payment-client";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
export default function FetchAccount() {
  interface PaymentAccount {
    id: string;
    name: string;
  }

  const GetPaymentAccount = () => {
    const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [currentAccount, setCurrentAccount] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    // Fetch user payment accounts on component mount
    useEffect(() => {
      fetchUserAccounts();
    }, []);

    const fetchUserAccounts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const paymentClient = await PaymentClient.init(
          NETWORK,
          testKeypair.toSuiAddress()
        );

        const userAccounts = paymentClient.getUserPaymentAccounts();
        setAccounts(userAccounts);

        if (userAccounts.length > 0) {
          setMessage(`Found ${userAccounts.length} payment accounts`);
        } else {
          setMessage("No payment accounts found");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch payment accounts"
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSelectAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setCurrentAccount(null);

      try {
        if (!selectedAccountId) {
          throw new Error("Please select an account");
        }

        const paymentClient = await PaymentClient.init(
          NETWORK,
          testKeypair.toSuiAddress()
        );

        await paymentClient.switchAccount(selectedAccountId);
        setCurrentAccount(paymentClient.paymentAccount);
        setMessage("Payment account loaded successfully");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load payment account"
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Find account by name
    const findAccountByName = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      const shopNameInput = (
        document.getElementById("shopName") as HTMLInputElement
      ).value;

      try {
        const paymentClient = await PaymentClient.init(
          NETWORK,
          testKeypair.toSuiAddress()
        );

        const userAccounts = paymentClient.getUserPaymentAccounts();
        const account = userAccounts.find((a) => a.name === shopNameInput);

        if (account) {
          setSelectedAccountId(account.id);
          setMessage(`Found account: ${shopNameInput}`);
        } else {
          setMessage(`No account found with name: ${shopNameInput}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find account");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-black text-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Get Payment Account</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-900 text-green-300 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-300 rounded">
            {error}
          </div>
        )}

        {/* Find account by name */}
        <form onSubmit={findAccountByName} className="mb-6">
          <div className="mb-4">
            <label htmlFor="shopName" className="block mb-2 font-medium">
              Shop Name
            </label>
            <input
              type="text"
              id="shopName"
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? "Searching..." : "Find Account by Name"}
          </button>
        </form>

        {/* Account selection form */}
        <form onSubmit={handleSelectAccount}>
          <div className="mb-4">
            <label htmlFor="accountSelect" className="block mb-2 font-medium">
              Select Account
            </label>
            <select
              id="accountSelect"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={accounts.length === 0 || isLoading}
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.id})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedAccountId}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? "Loading..." : "Load Account"}
          </button>
        </form>

        {currentAccount && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">
              Current Account Details
            </h3>
            <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(currentAccount, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>Get Payment Account</title>
          <meta name="description" content="Get your payment account details" />
        </Head>

        <main>
          <h1 className="text-2xl font-bold mb-6 text-center">
            Payment Account Details
          </h1>
          <GetPaymentAccount />
        </main>
      </div>
    </div>
  );
}

// import React from "react";

// export default function index() {
//   return <div>index</div>;
// }
