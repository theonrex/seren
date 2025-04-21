import { useState, useEffect } from "react";
import { getSuiVisionAccountUrl } from "@/lib/hooks/sui";
import { AUTH_API_BASE, LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";
import styles from "../../styles/index.module.css";
import { suiPayImg, gradinetImg } from "@/images";
import Image from "next/image";
import Balance from "@/components/Balance";
import { getZkLoginWalletAddress } from "@/utils/getZkLoginAddress";
import { ACCOUNT, NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { PaymentClient } from "../../payment/src/payment-client";
import { useRouter } from "next/router";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";

interface PaymentAccount {
  id: string;
  name: string;
}

export default function Index() {
  const router = useRouter();
  const account = useCurrentAccount();

  const user = account?.address;

  const isLoading = !account?.address;

  // const { user, isLoading } = useZkLoginSession();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>("");

  // console.log("userProfile", userProfile);

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const fetchUserAccounts = async () => {
    setLoading(true);

    try {
      const paymentClient = await PaymentClient.init(NETWORK, user);
      const userProfileData = paymentClient.getUserProfile();
      setUserProfile(userProfileData);

      const userAccounts = paymentClient.getUserPaymentAccounts();
      setAccounts(userAccounts);

      if (userAccounts.length > 0) {
        setMessage(`✅ Found ${userAccounts.length} payment account(s).`);
      } else {
        setMessage(`🚫 No payment accounts found. Please go to the `);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch payment accounts.");
    } finally {
      setLoading(false);
    }
  };

  // In your Index component, modify the handleSelectAccount function

  const handleSelectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!selectedAccountId) {
        throw new Error("Please select an account");
      }

      const paymentClient = await PaymentClient.init(
        NETWORK,
        testKeypair.toSuiAddress()
      );

      await paymentClient.switchAccount(selectedAccountId);
      const merchantAddress = paymentClient.paymentAccount;
      console.log("merchantAddres smerchantAddress", merchantAddress);

      // Get the account address from the account details
      const accountAddress = merchantAddress.id || selectedAccountId;

      // Instead of storing the entire account object, only store necessary properties
      // Extract only the data you need to persist
      const accountToStore = {
        id: merchantAddress.id,
      };

      // Store the simplified object
      localStorage.setItem(
        "currentPaymentAccount",
        JSON.stringify(accountToStore)
      );

      // Redirect to the account detail page with the address as the slug
      router.push(`/merchant/${accountAddress}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load payment account"
      );
      console.error(err);
      setLoading(false);
    }
  };

  // Find account by name
  const findAccountByName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  if (!user) return <p>Loading... Please Connect Your Wallet.</p>;

  console.log("accounts", accounts);

  if (user) {
    return (
      <div className="container mx-auto max-w-screen-xl">
        {/* <h1>
          Hello,{" "}
          {user
            ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-6)}`
            : "Not logged in"}
        </h1> */}

        {message && (
          <div className="mb-4 p-3 text-white rounded">
            {accounts.length > 0 ? (
              <div className="max-w-md mx-auto mt-8 p-6 bg-black text-white rounded shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Get Payment Account
                </h2>

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
                    <label
                      htmlFor="shopName"
                      className="block mb-2 font-medium"
                    >
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
                    <label
                      htmlFor="accountSelect"
                      className="block mb-2 font-medium"
                    >
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
              </div>
            ) : (
              <p>
                🚫 No payment accounts found. Please go to the{" "}
                <Link
                  href="/merchant/create"
                  className="underline text-blue-400"
                >
                  Create Merchant
                </Link>{" "}
                to create one.
              </p>
            )}
          </div>
        )}

        <div>
          <Link href={`${AUTH_API_BASE}/logout`}>Sign out</Link>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.main}>
        <div className={styles.suiDiv}>
          <div className={styles.suiPay}>
            <Image src={suiPayImg} width={600} height={600} alt="suiPayImg" />
            <h1>SuiPay</h1>
          </div>
          <div>
            <Link href={LOGIN_PAGE_PATH}>Sign in</Link>
          </div>
        </div>
        <div className={styles.gradinetImg}>
          <p>Powered by account.tech</p>
          <Image src={gradinetImg} width={600} height={600} alt="gradinetImg" />
        </div>
      </div>
    );
  }
}
