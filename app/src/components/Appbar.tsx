"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";

import bs58 from "bs58";
import nacl from "tweetnacl";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Chakra_Petch } from "next/font/google";


import { MdWallet } from "react-icons/md";
import toast from "react-hot-toast";

import solventLogo from "../../public/icons/solvent-main-logo.png";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useIsMounted from "@/hooks/useIsMounted";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const styles = {
  appBar: `w-full h-fit sm:h-14 px-2 bg-[#111314] border-b-[1px] border-[#EEF7FF] border-opacity-5`,
  wrapper: `w-full xl:w-10/12 h-full flex flex-wrap items-center justify-between gap-2 mx-auto`,
  logoContainer: `w-fit h-full flex items-center justify-center gap-2 cursor-pointer py-3`,
  logoIcon: `w-8 h-8`,
  logoTitle: `hidden sm:block text-xl font-bold text-[#EEF7FF]`,
  menuContainer: `w-fit h-full hidden lg:flex items-center justify-center`,
  menuItem: `w-fit h-full px-5 flex items-center text-center text-sm font-semibold text-[#EEF7FF] hover:text-[#A3D8FF] capitalize`,
  menuItemActive: `w-fit h-full px-5 flex items-center text-center text-sm font-semibold text-[#A3D8FF] bg-[#A3D8FF] bg-opacity-10 border-b-2 border-[#A3D8FF] capitalize`,
  walletContainer: `w-fit h-fit flex justify-center items-center gap-3 self-center py-1`,
};

const walletBtnStyles = {
  width: "fit-content",
  height: "34px",
  alignSelf: "center",
  color: "#EEF7FF",
  backgroundColor: "#2C2D30",
  hoverBackgroundColor: "#2c2d30b3",
  fontFamily: chakraPetch.style.fontFamily,
  fontSize: "14px",
  fontWeight: "bold",
  borderRadius: "5px",
  padding: "0 16px",
  opacity: 1, 
  transition: "opacity 100ms ease-in-out", 
};


const menus = [
  {
    name: "dashboard",
    link: "/dashboard",
  },
  {
    name: "campaigns",
    link: "/campaigns",
  },
  {
    name: "payment",
    link: "/payment",
  },
  {
    name: "withdraw",
    link: "/withdraw",
  },
  {
    name: "profile",
    link: "/profile",
  },
];

const Appbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { publicKey, signMessage, disconnecting, connected } = useWallet();
  const pathname = usePathname();

  //mounted state fix hydration error
  const mounted = useIsMounted();

  //sign in with wallet
  const signAndSendMessage = async () => {
    try {
      if (!publicKey || !connected) return;

      const token = localStorage.getItem("token");

      if (token) {
        const decodedToken = jwt.decode(token);
        //@ts-ignore
        if (decodedToken?.publicKey !== publicKey.toBase58()) {
          console.log("Token public key does not match wallet public key");
        } else {
          console.log("Token already exists");
        }
      }

      const message = new TextEncoder().encode(
        `${
          window.location.host
        } wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\nPlease sign into Solvent using your wallet.`
      );
      const signature = await signMessage?.(message);
      const b58Signature = signature ? bs58.encode(signature) : "";

      console.log("publicKey: " + publicKey.toBase58());
      console.log("signature: " + b58Signature);

      const response = await axios.post("/api/signin", {
        host: window.location.host,
        signature: b58Signature,
        publicKey: publicKey.toBase58(),
      });

      if (response.status === 200) {
        toast.success("Wallet connected!");
        localStorage.setItem("token", response.data.token);
      }
    } catch (error: any) {
      console.log("Error signing message " + error);
    }
  };

  //useEffects

  useEffect(() => {
    // signAndSendMessage();
    //eslint-disable-next-line
  }, [publicKey]);

  //remove jwt token on disconnect
  useEffect(() => {
    if (disconnecting) {
      localStorage.removeItem("token");
      console.log("Wallet disdisconnecting!");
      toast.error("Wallet disconnected!");
    }
  }, [disconnecting]);

  useEffect(() => {}, []);

  return (
    <section className={styles.appBar}>
      <div className={styles.wrapper}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src={solventLogo}
            alt="solventLogo"
            className={styles.logoIcon}
          />
          <span className={styles.logoTitle}>Solvent</span>
        </Link>

        <div className={styles.menuContainer}>
          {menus.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className={
                pathname.includes(item.link) ? styles.menuItemActive : styles.menuItem
              }
            >
              {item.name}
            </Link>
          ))}
        </div>
        {mounted && (
          <div
            className={styles.walletContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <WalletMultiButton
              endIcon={<MdWallet color="#EEF7FF" size={32} />}
              style={{
                ...walletBtnStyles,
                backgroundColor: isHovered ? walletBtnStyles.hoverBackgroundColor : walletBtnStyles.backgroundColor,
            }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Appbar;
