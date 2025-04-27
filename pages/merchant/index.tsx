import { useState, useEffect, SetStateAction } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import Image from "next/image";
import ConnectWallet from "@/components/connectWallet";

// Define interface for payment accounts
interface PaymentAccount {
  id: string;
  name: string;
}

type Profile = {
  name: string;
  email: string;
  address: string;
};

export default function Index() {
  const router = useRouter();
  const account = useCurrentAccount();
  const user: string | any = account?.address;
  const isLoading = !account?.address;

  const [accounts, setAccounts] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [userProfile, setUserProfile] = useState<Profile | any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name");

  useEffect(() => {
    if (user) {
      fetchUserAccounts();
    }
  }, [user]);

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
        setMessage(`🚫 No payment accounts found. Please create one.`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch payment accounts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (e: { preventDefault: () => void }) => {
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

      // Store minimal account info
      const accountToStore = {
        id: merchantAddress.id,
      };

      localStorage.setItem(
        "currentPaymentAccount",
        JSON.stringify(accountToStore)
      );

      router.push(`/merchant/${merchantAddress.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load payment account"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findAccountByName = (e: {
    preventDefault: () => void;
    target: { value: SetStateAction<string> };
  }) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  // Filter and sort accounts
  const filteredAccounts = accounts.filter(
    (account: { name: string; id: string }) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "id") {
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  // Truncate address for display
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  if (!user) {
    return <ConnectWallet />;
  }

  return (
    <div className="min-h-screen bg-black text-sky-400 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Merchant Accounts</h1>
          <p className="text-sky-300 mt-2 md:mt-0">
            Connected: {truncateAddress(user)}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
          </div>
        ) : accounts.length > 0 ? (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-xl font-semibold mb-4 md:mb-0">
                Your Payment Accounts
              </h2>
              <Link href="/merchant/create">
                <span className="px-4 py-2 bg-sky-600 hover:bg-sky-700 transition-colors text-white rounded-lg">
                  Create New Account
                </span>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={findAccountByName}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sky-300 placeholder-gray-500"
                />
              </div>

              <div className="w-full md:w-1/4 md:ml-4">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sky-300"
                >
                  <option value="name">Sort by Name</option>
                  <option value="id">Sort by Address</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleSelectAccount}>
              <div className="grid gap-4">
                {sortedAccounts.map((account) => (
                  <label
                    key={account.id}
                    className={`flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer transition-colors ${
                      selectedAccountId === account.id
                        ? "bg-sky-900 border-sky-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountSelect"
                      value={account.id}
                      checked={selectedAccountId === account.id}
                      onChange={() => setSelectedAccountId(account.id)}
                      className="h-5 w-5 text-sky-500"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-lg">{account.name}</h3>
                      <p className="text-gray-400 text-sm font-mono">
                        {truncateAddress(account.id)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-800 text-red-300 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || !selectedAccountId}
                  className="w-full py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                      Loading...
                    </span>
                  ) : (
                    "Load Selected Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-xl mb-6">No payment accounts found.</p>
            <Link href="/merchant/create">
              <span className="px-6 py-3 bg-sky-600 hover:bg-sky-700 transition-colors text-white rounded-lg font-medium">
                Create Your First Account
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
