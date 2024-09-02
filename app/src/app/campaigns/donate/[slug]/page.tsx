"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { FormField, Loader, ProfilePlaceholder } from "@/components";
import {
  ICampaign,
  ICreateCampaign,
  useSolventContext,
} from "@/context/solvent-context";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { Oval } from "react-loader-spinner";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { FaDonate } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  checkIftheTokenMatchesTheWallet,
  formatWalletAddress,
} from "@/utils/constants";
import { BN, web3 } from "@coral-xyz/anchor";
import { format } from "path";
import prevImage from "../../../../../public/images/prevImg.png";

const styles = {
  campaign: `w-full h-screen flex flex-col`,
  campaignHeaderWrapper: `w-full h-fit h-16 sm:h-28 px-6 sm:px-8 py-2 flex items-center border-b-[1px] border-[#EEF7FF] border-opacity-5 rouded-md`,
  campaignHeader: `w-full xl:w-8/12 h-fit flex flex-wrap items-center justify-between gap-2 mx-auto`,
  campaignNav: `w-fit h-full flex items-center justify-center gap-5`,
  campaignNavIcon: `px-1 cursor-pointer`,
  campaignTitle: `hidden sm:block text-lg font-bold text-[#EEF7FF] cursor-default`,
  searchContainer: `relative flex items-center w-1/3 max-w-96 h-12 rounded-lg focus-within:shadow-lg bg-[#2C2D30] overflow-hidden`,
  logoContainer: `grid place-items-center h-full w-12 text-gray-300`,
  logoIcon: `w-5 h-5`,
  searchInput: `peer h-full w-full outline-none text-sm text-[#EEF7FF] bg-transparent pr-2`,
  primaryButton: `w-fit h-fit text-center text-sm font-semibold text-[#EEF7FF]  px-4 py-2 rounded-md capitalize bg-[#2C2D30] bg-opacity-100 hover:bg-opacity-70 transition-opacity duration-100 ease-in-out`,
  secondaryButton: `w-11/12 sm:w-80 h-fit flex items-center justify-center text-center text-md font-semibold text-[#EEF7FF] bg-[#2C2D30] px-4 py-4 mx-1 rounded-md capitalize transition-opacity duration-100 ease-in-out`,
  campaignBodyWrapper: `w-full h-fit flex flex-col items-center justify-center gap-5 sm:gap-10 rounded-2xl px-2 py-10 border-b-[1px] border-[#EEF7FF] border-opacity-5`,
  campaignBody: `w-full lg:w-5/6 xl:w-4/6 h-fit flex flex-col items-center justify-center gap-4 mx-auto px-4`,
  progressContainer: `w-full h-fit flex flex-col items-start justify-between gap-4`,
  progressBarWrapper: `w-full h-fit flex items-center justify-between gap-2 bg-[#EEF7FF] rounded-md`,
  progressBar: `h-2 bg-[#01A95C] rounded-md`,
  progressText: `w-fit h-fit text-center text-sm font-semibold text-[#EEF7FF] hover:text-[#A3D8FF] capitalize`,
  imageContainer: `relative w-full h-2/3 flex items-center justify-center overflow-hidden `,
  floatingInfoContainer: `absolute left-0 bottom-0 w-fit h-fit flex items-center justify-around gap-2 text-[#01A95C] px-4 py-1 rounded-md capitalize bg-[#2C2D30] backdrop-blur-sm bg-opacity-80 transition-opacity duration-100 ease-in-out`,
  floatingInfoIcon: `w-4 h-4`,
  floatingInfoText: `w-fit h-fit text-[#EEF7FF] text-sm font-semibold`,
  detailsContainer: `w-full h-full px-2 py-2 rounded-md flex flex-col gap-2`,
};

const DonateToCampaogn = () => {
  const { getCampaigns, donateToCampaign} = useSolventContext();
  const [campaign, setCampaign] = useState<ICampaign>();
  const { slug } = useParams();
  const { initializeGlobalPool } = useSolventContext();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet(); //wallet for sign and pay
  const { connection } = useConnection(); //connection for send transaction
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (!slug) {
      return;
    }
    const getCampaign = async () => {
      setIsLoadingCampaign(true);
      try {
        const data = await getCampaigns();
        const selectedCampaign = data.find((el) => el.publicKey === slug);
        console.log(selectedCampaign);
        setCampaign(selectedCampaign);
        setIsLoadingCampaign(false);
      } catch (error) {
        setIsLoadingCampaign(false);

        console.log(error);
      }
    };
    getCampaign();
  }, [slug, wallet, connection]);

  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (fieldName === "amount") {
      let value = e.target.value;
      const regex = /^\d*\.?\d{0,4}$/; // Regex to allow up to 4 decimal places

      if (!regex.test(value)) {
        // If the value doesn't match, truncate to 4 decimal places
        const parts = value.split(".");
        if (parts.length > 1) {
          // If there's a decimal part, limit it to 4 digits
          parts[1] = parts[1].slice(0, 4);
          value = parts.join(".");
        } else {
          // If there's no decimal part, just keep the integer part
          value = parts[0];
        }
      }
      e.target.value = value; // Update the input value
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please verify your wallet first");
      return;
    }

    const checkIfTokenVlaid = await checkIftheTokenMatchesTheWallet(
      publicKey.toBase58(),
      token
    );

    if (!checkIfTokenVlaid) {
      toast.error("Token does not match wallet");
      return;
    }

    if (!campaign) {
      throw new Error("Campaign data not found");
    }

    if (!amount) {
      throw new Error("Amount not found");
    }

    try {
      setIsLoading(true);

      const campaignAccount = new PublicKey(campaign.publicKey);
      console.log(campaignAccount);
      const owner = new PublicKey(campaign.owner);
      console.log(owner);
      const transactionId = await donateToCampaign(
        campaignAccount,
        owner,
        Number(amount)
      );
      console.log("Donated to campaign: " + transactionId);
      toast.success("Donated to campaign successfully!");
      setIsLoading(false);
      setAmount('');
      push("/dashboard");
    } catch (error: any) {
      setIsLoading(false);

      toast.error("Error creating campaign: " + error?.message);
      console.log(error);
    }
  };

  if (isLoadingCampaign) {
    return <Loader isLoading={isLoadingCampaign} />;
  }


  return (
    <section className={styles.campaign}>
      <div className={styles.campaignHeaderWrapper}>
        <div className={styles.campaignHeader}>
          <div className={styles.campaignNav}>
            <Link href="/campaigns" className={styles.campaignNavIcon}>
              <BsArrowLeftSquareFill color="#EEF7FF" size={24} />
            </Link>
            <div className={styles.campaignTitle}>Donate to Campaign</div>
          </div>
          <Link href="/campaigns" className={styles.primaryButton}>
            Campaigns
          </Link>
        </div>
      </div>
      <div className={styles.campaignBodyWrapper}>
        <div className={styles.campaignBody}>
          {campaign ? (
            <>
              <div className="w-full h-fit flex max-md:flex-col items-start justify-between flex-wrap gap-5">
                <div className="order-2 md:order-1 flex-1 flex flex-col gap-10 h-full flex flex-col items-left justify-center">
                  <h1 className="text-white text-2xl font-bold capitalize">
                    {campaign.title}
                  </h1>
                  <p className="text-white text-xl">{campaign.description}</p>
                </div>

                <div className="order-1 md:order-2 flex flex-col gap-10">
                  <div className={styles.imageContainer}>
                    <Image
                      src={campaign.image ?? prevImage}
                      width={388}
                      height={258}
                      alt="campaignImage"
                      className="rounded-md"
                    />
                    <div className={styles.floatingInfoContainer}>
                      <FaDonate className={styles.floatingInfoIcon} />
                      <div className={styles.floatingInfoText}>
                        {campaign.donations.length} Donations
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-start items-center gap-2">
                  <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
                      <ProfilePlaceholder />
                    </div>
                    <div className="text-white text-sm font-bold">
                      {formatWalletAddress(campaign.owner.toBase58())}
                    </div>
             
                  </div>

                  <div className={styles.progressContainer}>
                    <div className={styles.progressText}>{`${(
                      campaign.amountCollected / LAMPORTS_PER_SOL
                    ).toFixed(4)} SOL raised out of ${(
                      campaign.target / LAMPORTS_PER_SOL
                    ).toFixed(4)} SOL`}</div>
                    <div className={styles.progressText}>{`Total Matched: ${
                      campaign.totalMatched / LAMPORTS_PER_SOL
                    } SOL`}</div>

                    <div className={styles.progressBarWrapper}>
                      <div
                        className={styles.progressBar}
                        style={{
                          width: `${
                            (campaign.amountCollected / campaign.target) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <FormField
                  labelName="Donate Amount *"
                  placeholder="Set a donation amount in SOL"
                  inputType="text"
                  value={amount}
                  handleChange={(e) => handleFormFieldChange("amount", e)}
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <div>Campaign not found</div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className={`${styles.secondaryButton} ${
            isLoading
              ? "text-opacity-70 bg-opacity-70"
              : "bg-opacity-100 hover:bg-opacity-70"
          }`}
          type="button"
          disabled={isLoading}
        >
          <Oval
            visible={isLoading}
            height="24"
            width="24"
            color="#2C2D30"
            secondaryColor="#EEF7FF"
            strokeWidth={3}
            ariaLabel="oval-loading"
            wrapperClass="solvent-loader"
          />
          {isLoading ? "Donating..." : "Donate"}
        </button>
      </div>
    </section>
  );
};

export default DonateToCampaogn;
