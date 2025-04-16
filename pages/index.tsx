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
// This is a publically accessible page, displaying optional contents for signed-in users.
export default function Index() {
  const { user, isLoading } = useZkLoginSession();

  if (isLoading) return <p>Loading zkLogin session...</p>;

  if (user) {
    // Signed-in experience.
    return (
      <div className="container mx-auto max-w-screen-xl">
        {/* <h1>Hello, {user.oidProvider} user!</h1> */}
        <div>
          <Balance />

          <FetchAccount />
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
            <Link href={LOGIN_PAGE_PATH}>Sign in</Link>
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
