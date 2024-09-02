"use client";

import { IoSearchOutline } from "react-icons/io5";

import { FundCard } from "@/components";
import { useSolventContext } from "@/context/solvent-context";
import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GrDashboard } from "react-icons/gr";

const styles = {
  dashboard: `w-full h-screen flex flex-col`,
  dashboardHeaderWrapper: `w-full h-fit min-h-28 px-6 sm:px-8 py-2 flex items-center border-b-[1px] border-[#EEF7FF] border-opacity-5 rouded-md`,
  dashboardHeader: `w-full xl:w-8/12 h-fit flex flex-wrap items-center justify-between gap-2 mx-auto`,
  dashBoardNav: `w-fit h-full flex items-center justify-center gap-5`,
  dashBoardNavIcon: `px-2 cursor-pointer`,
  dashboardTitle: `hidden sm:block text-lg font-bold text-[#EEF7FF] cursor-default`,
  searchContainer: `relative flex items-center w-1/3 max-w-96 h-12 rounded-lg focus-within:shadow-lg bg-[#2C2D30] overflow-hidden`,
  inputLogoContainer: `grid place-items-center h-full w-12 text-gray-300`,
  inputLogoIcon: `w-5 h-5`,
  searchInput: `peer h-full w-full outline-none text-sm text-[#EEF7FF] bg-transparent pr-2`,
  primaryButton: `w-fit h-fit text-center text-sm font-semibold text-[#EEF7FF]  px-4 py-2 rounded-md capitalize bg-[#2C2D30] bg-opacity-100 hover:bg-opacity-70 transition-opacity duration-100 ease-in-out`,
  dashboardBodyWrapper: `w-full h-fit min-h-96 px-2 border-b-[1px] border-[#EEF7FF] border-opacity-5 rouded-md`,
  dashboardBody: `w-full xl:w-10/12 h-full flex flex-wrap items-center justify-start gap-10 mx-auto px-2 py-10`,
};
export interface ICampaign {
  publicKey: PublicKey;
  owner: PublicKey;
  title: string;
  description: string;
  target: BN;
  deadline: BN;
  amountCollected: BN;
  totalMatched: BN;
  image: string;
  donators: PublicKey[];
  donations: PublicKey[];
  status: {
    active?: {};
    cancelled?: {};
    completed?: {};
  };
}
const Dashboard = () => {
  const { getCampaigns} = useSolventContext();
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const wallet = useAnchorWallet(); //wallet for sign and pay
  const { connection } = useConnection(); //connection for send transaction
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const filterCampaigns = campaigns?.filter((el) => el.owner.toBase58() === publicKey?.toBase58());
  //get campaigns
  useEffect(() => {
    const getAllCampaigns = async () => {
      try {
        const campaigns = await getCampaigns();
        setCampaigns(campaigns.reverse());
      } catch (error) {
        console.log(error);
      }
    };
    getAllCampaigns();
    // eslint-disable-next-line
  }, [wallet, connection]);

  return (
    <section className={styles.dashboard}>
      <div className={styles.dashboardHeaderWrapper}>
        <div className={styles.dashboardHeader}>
          <div className={styles.dashBoardNav}>
            <Link href="/dashboard">
              <GrDashboard color="#EEF7FF" size={24} />
            </Link>
            <div className={styles.dashboardTitle}>Dashboard</div>
          </div>
          <div className={styles.searchContainer}>
            <div className={styles.inputLogoContainer}>
              <IoSearchOutline
                color="#EEF7FF"
                className={styles.inputLogoIcon}
              />
            </div>

            <input
              className={styles.searchInput}
              type="text"
              id="search"
              placeholder="Search campaigns.."
            />
          </div>
          <Link
            href="/dashboard/create-campaign"
            className={styles.primaryButton}
          >
            Create Campaign
          </Link>
        </div>
      </div>
      <div className={styles.dashboardBodyWrapper}>
        <div className={styles.dashboardBody}>
          {
            //@ts-ignore
            filterCampaigns && filterCampaigns?.length > 0 && filterCampaigns.map((el, index) => (
              <FundCard key={index} campaign={el}/>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
