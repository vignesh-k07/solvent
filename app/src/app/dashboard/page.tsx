"use client";
import React, { useEffect, useState } from "react";
import { Program, AnchorProvider, web3} from "@coral-xyz/anchor";
import { SOLVENT_PROGRAM_INTERFACE } from "@/utils/constants";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

import { IoSearchOutline } from "react-icons/io5";

import BN from "bn.js"; // Import BN
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Crowdfunding } from "@/types/crowdfunding"; // Import the crowdfunding type
import CampaignDashboard from "../components/CampaignDashboard";
import CampaignCard, { CampaignCardProps } from "../components/CampaignCard";
import { set } from "mongoose";

const styles = {
  dashboard: `w-full h-screen flex flex-col`,
  dashboardHeaderWrapper: `w-full h-28 px-2 border-b-[1px] border-[#EEF7FF] border-opacity-5 rouded-md`,
  dashboardHeader: `w-full xl:w-8/12 h-full flex flex-wrap items-center justify-around gap-2 mx-auto`,
  dashboardTitle: `text-lg font-bold text-[#EEF7FF] cursor-default`,
  searchContainer: `relative flex items-center w-1/3 max-w-96 h-12 rounded-lg focus-within:shadow-lg bg-[#2C2D30] overflow-hidden`,
  logoContainer: `grid place-items-center h-full w-12 text-gray-300`,
  logoIcon: `w-5 h-5`,
  searchInput: `peer h-full w-full outline-none text-sm text-[#EEF7FF] bg-transparent pr-2`,
  primaryButton: `w-fit h-fit text-center text-sm font-semibold text-[#EEF7FF]  px-4 py-2 rounded-md capitalize bg-[#2C2D30] bg-opacity-100 hover:bg-opacity-70 transition-opacity duration-100 ease-in-out`,
  dashboardBodyWrapper: `w-full h-fit min-h-96 px-2 border-b-[1px] border-[#EEF7FF] border-opacity-5 rouded-md`,
  dashboardBody: `w-full xl:w-10/12 h-full flex flex-wrap items-center justify-start gap-10 mx-auto px-2 py-10`,
};

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState<CampaignCardProps[]>([]);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();

  async function makePayment(account: Keypair, lamports: number) {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey: account.publicKey,
        lamports,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
    console.log("Funding account with transaction signature: ", signature);
  }

  const fundAccount = async (accountPublicKey: PublicKey, amount: number) => {
    if (!wallet || !publicKey || !signTransaction) {
      throw new Error("Wallet or signTransaction method is missing.");
    }
    // Create a transaction to transfer SOL
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey, // Wallet public key
        toPubkey: accountPublicKey,
        lamports: amount,
      })
    );

    // Fetch recent blockhash and set it on the transaction
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    const txSignature = await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
    console.log("Funding account with transaction signature: ", txSignature);
  };

  const createCampaign = async () => {
    try {
      if (!wallet || !connection || !signTransaction || !publicKey) {
        return;
      }

      const campaignAccount = Keypair.generate();

      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });

      if (!provider) return;

      //create new program interface combine with program id
      const program = new Program(
        SOLVENT_PROGRAM_INTERFACE,
        provider
      ) as Program<Crowdfunding>;

      console.log(program);

      const title = "Innovative Solar Panel Project";
      const description =
        "Join us in revolutionizing renewable energy with our innovative solar panel design. Our goal is to provide affordable and efficient solar energy solutions for everyone.";
      const targetAmount = new BN(656);
      console.log(targetAmount);
      console.log(targetAmount.toNumber());
      const image = "https://shorturl.at/dEvYV";

      // Fund the campaignAccount before using it
      const lamports = await connection.getMinimumBalanceForRentExemption(
        program.account.campaign.size
      );

      console.log("Funding account with lamports: ", lamports);
      await makePayment(campaignAccount, lamports);

      let initAccounts = {
        campaign: campaignAccount.publicKey,
        creator: wallet.publicKey,
        system_program: web3.SystemProgram.programId,
      };

      const txn = await program.methods
        .createCampaign(title, description, targetAmount, image)
        .accounts(initAccounts)
        .signers([campaignAccount])
        .rpc();

      console.log("Transaction signature:🫡✅ ", txn);

      const campaign = await program.account.campaign.fetch(
        campaignAccount.publicKey
      );
      console.log("Campaign details:", campaign);
    } catch (error) {
      console.log(error);
    }
  };

  const getCampaign = async () => {
    try {
      if (!wallet || !connection || !signTransaction || !publicKey) {
        return;
      }

      const campaignAddresses = ["2ebmuFvLzHjF6PNE13puG7ejTHa9TQvK8s53CPFEiRjU",  "8o1KGUdmRmL19sqjK4JQXLdmijUzHaHGitfDCRATrPfZ",  "8o1KGUdmRmL19sqjK4JQXLdmijUzHaHGitfDCRATrPfZ"]
      const campaignAccounts = campaignAddresses.map((address) => new PublicKey(address));


      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });

      if (!provider) return;

      //create new program interface combine with program id
      const program = new Program(
        SOLVENT_PROGRAM_INTERFACE,
        provider
      ) as Program<Crowdfunding>;

      console.log(program);

      // Fetch the campaign details using the public key
      const campaigns = await program.account.campaign.fetchMultiple(campaignAccounts);

      console.log("Campaign details:", campaigns[2]?.targetAmount.toNumber());
      //@ts-ignore
      setCampaigns(campaigns);
      // setCampaigns(campaigns);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className={styles.dashboard}>
      <div className={styles.dashboardHeaderWrapper}>
        <div className={styles.dashboardHeader}>
          <div className={styles.dashboardTitle} onClick={getCampaign}>
            Dashboard
          </div>
          <div className={styles.searchContainer}>
            <div className={styles.logoContainer}>
              <IoSearchOutline color="#EEF7FF" className={styles.logoIcon} />
            </div>

            <input
              className={styles.searchInput}
              type="text"
              id="search"
              placeholder="Search campaigns.."
            />
          </div>
          <button className={styles.primaryButton} onClick={createCampaign}>
            Create Campaign
          </button>
        </div>
      </div>
      <div className={styles.dashboardBodyWrapper}>
        <div className={styles.dashboardBody}>
          {
            //@ts-ignore
            campaigns.map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} />
            ))
          }
        </div>
      </div>
      {/* <CampaignDashboard /> */}
    </section>
  );
};

export default Dashboard;
