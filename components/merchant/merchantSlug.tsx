import React, { useEffect, useState } from "react";
import { getSuiBalance } from "@/utils/getBalance";
import {
  FaArrowDown,
  FaMoneyBillWave,
  FaArrowUp,
  FaHistory,
  FaCopy,
} from "react-icons/fa";
import IssuePaymentModal from "./modal";
import { PaymentClient } from "../../payment/src/payment-client";
import { NETWORK, testKeypair } from "../../payment/test/ptbs/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import RecentTransaction from "./recentTransaction";
import { ACCOUNT } from "../../payment/test/ptbs/utils";
import { useRouter } from "next/router";
import PendingPayments from "./PendingPayments";
import WithdrawModal from "./WithdrawalModal";
import DepositModal from "./DepositModal";
export default function MerchantSlug({ merchantAddress }: any) {
  const account = useCurrentAccount();
  const user: string = account!?.address;
  const router = useRouter();

  const { id } = router.query;

  const [balance, setBalance] = useState<string>("0");
  const [pendingPayments, setPendingPayments] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedPayment, setCopiedPayment] = useState<string | null>(null);
  const [paymentAccount, setPaymentAccount] = useState<any>(null);
  const [ownedObjects, setOwnedObjects] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [userAccount, setUserAccount] = useState<string | any>("");

  const currentAccount = useCurrentAccount();
  const [paymentClient, setPaymentClient] = useState<PaymentClient | null>(
    null
  );
  // console.log("paymentAccount", paymentAccount);
  // console.log("userAccount", userAccount);
  // console.log("pendingPayments", pendingPayments);
  // console.log("ownedObjects", ownedObjects);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!currentAccount?.address) return;

      try {
        setLoading(true);

        const client = await PaymentClient.init(
          NETWORK,
          currentAccount.address,
          ACCOUNT
        );

        const userAccounts = client.getUserPaymentAccounts();
        const accountId = userAccounts.find((a) => a.id === id)?.id;

        if (accountId) {
          await client.switchAccount(accountId);
        }

        setPaymentClient(client);
        setPaymentAccount(client.paymentAccount);

        const objects = await client.getOwnedObjects();
        setOwnedObjects(objects);

        const userA = await client.getUserProfile();
        setUserAccount(userA);
      } catch (err) {
        console.error("Error loading payment data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  useEffect(() => {
    if (!merchantAddress) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch balance
        const balanceData = await getSuiBalance(merchantAddress);
        setBalance(balanceData);

        // Fetch pending payments
        const paymentClient = await PaymentClient.init(
          NETWORK,
          user,
          merchantAddress
        );
        const payments = await paymentClient.getPendingPayments();
        setPendingPayments(payments);

        // For demo purposes, let's create some mock recent transactions
        setRecentTransactions([
          {
            id: "1",
            description: "Payment from Customer A",
            amount: 2.5,
            date: "2025-04-22",
            type: "incoming",
          },
          {
            id: "2",
            description: "Platform fee",
            amount: 0.15,
            date: "2025-04-21",
            type: "outgoing",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [merchantAddress]);

  useEffect(() => {
    if (!pendingPayments) return;

    const checkPayments = () => {
      for (const key in pendingPayments) {
        const payment = pendingPayments[key];
        if (payment.fields.creator !== user) {
          router.push("/merchant");
        } else {
          console.log(""); 
        }
      }
    };

    checkPayments();
  }, [pendingPayments, user]);

  // Helper function to format amount with proper decimals
  const formatAmount = (amount: number) => {
    if (typeof amount === "bigint") {
      const amountInDecimal = Number(amount) / 1e9;
      return amountInDecimal.toFixed(4);
    }
    return amount;
  };

  // Helper function to truncate address for display
  const truncateAddress = (address: string, isMobile = false) => {
    if (!address) return "";
    if (isMobile) {
      return `${address.substring(0, 6)}...${address.substring(
        address.length - 4
      )}`;
    }
    return `${address.substring(0, 10)}...${address.substring(
      address.length - 6
    )}`;
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    if (!merchantAddress) return;
    navigator.clipboard.writeText(merchantAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleCopy = (key: string) => {
    setCopiedPayment(key);
    setTimeout(() => setCopiedPayment(null), 2000); // Reset after 2 seconds
  };
  return (
    <div className="min-h-screen  text-sky-400 px-4 py-6 font-sans">
      <div className=" mx-auto space-y-6">
        {/* Header with back link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/merchant">
            <span className="flex items-center text-sky-500 hover:text-sky-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Accounts
            </span>
          </Link>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <span className="text-gray-400 text-sm">Merchant Dashboard</span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Merchant Address</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <p className="text-sm sm:text-md font-mono bg-gray-800 p-2 rounded-lg break-all w-full sm:w-auto">
              <span className="hidden sm:inline">
                {merchantAddress
                  ? truncateAddress(merchantAddress)
                  : "Not available"}
              </span>
              <span className="inline sm:hidden">
                {merchantAddress
                  ? truncateAddress(merchantAddress, true)
                  : "Not available"}
              </span>
            </p>
            <button
              onClick={copyToClipboard}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="Copy address"
            >
              <FaCopy className="text-sky-400" />
              <span className="sm:hidden">{copied ? "Copied!" : "Copy"}</span>
              {copied && (
                <span className="hidden sm:inline text-green-400 text-sm">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Total Balance</p>
          {isLoading ? (
            <div className="h-10 flex items-center">
              <div className="animate-pulse bg-gray-800 rounded h-8 w-32"></div>
            </div>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
              {balance !== null ? `${balance} SUI` : "No balance"}
            </h2>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            <DepositModal merchantAddress={merchantAddress} />
            <WithdrawModal merchantAddress={merchantAddress} />{" "}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center">
            <FaHistory className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
            <span className="text-xs sm:text-sm">History</span>
          </div>{" "}
          <div className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center">
            <IssuePaymentModal merchantAddress={merchantAddress} />
          </div>
          <div className="bg-gray-900 p-3 sm:p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer border border-gray-800 text-center">
            <FaMoneyBillWave className="text-lg sm:text-2xl mx-auto mb-1 sm:mb-2 text-sky-400" />
            <span className="text-xs sm:text-sm">Earn</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Pending Payments Section */}
          <PendingPayments
            isLoading={isLoading}
            pendingPayments={pendingPayments}
            handleCopy={handleCopy}
            copiedPayment={copiedPayment}
            formatAmount={formatAmount}
          />

          {/* Recent Transactions Section */}
          <RecentTransaction merchantAddress={merchantAddress} />
        </div>
      </div>
    </div>
  );
}
