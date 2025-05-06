import { useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaPaperPlane,
} from "react-icons/fa";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import Link from "next/link";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawalModal";

export default function WalletOverview() {
  const [suiBalance, setSuiBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [suiPrice, setSuiPrice] = useState<number>(0);
  const [usdcPrice, setUsdcPrice] = useState<number>(1);
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  useEffect(() => {
    const fetchBalances = async () => {
      if (!account?.address) return;

      const suiResponse = await suiClient.getBalance({
        owner: account.address,
      });
      const sui = Number(suiResponse.totalBalance) / 1_000_000_000;
      setSuiBalance(sui);

      const usdcResponse = await suiClient.getBalance({
        owner: account.address,
        coinType:
          "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
      });
      const usdc = Number(usdcResponse.totalBalance) / 1_000_000;
      setUsdcBalance(usdc);

      const priceRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=sui,tether&vs_currencies=usd"
      );
      const prices = await priceRes.json();
      setSuiPrice(prices?.sui?.usd || 0);
      setUsdcPrice(prices?.tether?.usd || 1);
    };

    fetchBalances();
  }, [account?.address, suiClient]);

  const totalValue = (suiBalance * suiPrice + usdcBalance * usdcPrice).toFixed(
    2
  );

  if (!account) {
    return (
      <div className="wallet-container">
        <div className="glass-panel text-center">
          <div className="animate-spin rounded-full border-t-4 border-b-4 border-white h-12 w-12 mx-auto mb-4" />
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="max-w-4xl w-full space-y-10">
        <div className="glass-panel">
          <p className="subtitle">Total Wallet Value</p>
          <h1 className="total-value">${totalValue}</h1>
        </div>

        <div className="grid grid-2">
          <div className="glass-panel">
            <p className="subtitle">SUI Balance</p>
            <h2 className="token-name">{suiBalance.toFixed(3)} SUI</h2>
            <p className="token-value">
              (${(suiBalance * suiPrice).toFixed(2)})
            </p>
          </div>
          <div className="glass-panel">
            <p className="subtitle">USDC Balance</p>
            <h2 className="token-name">{usdcBalance.toFixed(2)} USDC</h2>
            <p className="token-value">
              (${(usdcBalance * usdcPrice).toFixed(2)})
            </p>
          </div>
        </div>

        <div className="glass-panel">
          <p className="subtitle">Wallet Address</p>
          <p className="wallet-address">{account.address}</p>
        </div>

        <div className="grid grid-4 text-center">
          <Link className="glass-panel icon-box" href="/makepayment">
            {" "}
            <FaPaperPlane />
            <span>Make Payment</span>
          </Link>
          {/* <div className="glass-panel icon-box">
            <FaArrowUp />
          </div> */}

          <WithdrawModal />
          <div className="glass-panel icon-box">
            <FaMoneyBillWave />
            <span>Earn</span>
          </div>
          <DepositModal copyAddress={account.address} />
        </div>
      </div>
    </div>
  );
}
