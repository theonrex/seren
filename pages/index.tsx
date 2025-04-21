import { getSuiVisionAccountUrl } from "@/lib/hooks/sui";
import { AUTH_API_BASE, LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";
import styles from "../styles/index.module.css";
import { suiPayImg, gradinetImg } from "@/images";
import Image from "next/image";
import Balance from "@/components/Balance";
import { getZkLoginWalletAddress } from "@/utils/getZkLoginAddress";
import { Button } from "flowbite-react";
import FetchAccount from "@/components/dashboard";
import ClientPage from "@/components/Client";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";

// This is a publically accessible page, displaying optional contents for signed-in users.
export default function Index() {
  const account = useCurrentAccount();

  if (account) {
    // Signed-in experience.
    return (
      <div className="container mx-auto max-w-screen-xl">
        {/* <h1>Hello, {user.oidProvider} user!</h1> */}
        <div>
          <ClientPage />
          {/* <FetchAccount /> */}
        </div>
        <div>
          <Link href={`${AUTH_API_BASE}/logout`}>Sign out</Link>
        </div>
      </div>
    );
  } else {
    // Anonymous experience.
    return (
      <div className={styles.main}>
        <div className={styles.suiDiv}>
          <div className={styles.suiPay}>
            <Image src={suiPayImg} width={600} height={600} alt="suiPayImg" />
            <h1>SuiPay</h1>
          </div>
          <div>
            <ConnectButton />{" "}
          </div>
        </div>
        <div className={styles.gradinetImg}>
          <p>Powered by account.tech</p>{" "}
          <Image src={gradinetImg} width={600} height={600} alt="gradinetImg" />
        </div>
      </div>
    );
  }
}
