import React from "react";
import styles from "../styles/index.module.css";
import Image from "next/image";
import { suiPayImg, gradinetImg } from "@/images";
import { ConnectButton } from "@mysten/dapp-kit";

export default function ConnectWallet() {
  return (
    <div className={styles.main}>
      <div className={styles.suiDiv}>
        <div className={styles.suiPay}>
          <Image src={suiPayImg} width={600} height={600} alt="seren" />
          <h1> Seren</h1>
        </div>
        <div>
          <ConnectButton />{" "}
        </div>
      </div>
      <div className={styles.gradinetImg}>
        {/* <p>Powered by account.tech</p>{" "} */}
        {/* <Image src={gradinetImg} width={600} height={600} alt="gradinetImg" /> */}
      </div>
    </div>
  );
}
