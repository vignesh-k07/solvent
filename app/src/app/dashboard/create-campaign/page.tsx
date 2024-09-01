"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import { BsArrowLeftSquareFill } from "react-icons/bs";
import { CustomButton, FormField } from "@/components";
import { checkIfImage } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { AnchorError, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import Image from "next/image";
import { use } from "chai";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ICreateCampaign } from "@/context/solvent-context";

const styles = {
  campaign: `w-full h-screen flex flex-col`,
  campaignHeaderWrapper: `w-full h-fit h-16 sm:h-28 px-6 sm:px-8 flex items-center border-b-[1px] border-[#EEF7FF] border-opacity-5 rouded-md`,
  campaignHeader: `w-full xl:w-8/12 h-fit flex flex-wrap items-center justify-between gap-2 mx-auto`,
  campaignNav: `w-fit h-full flex items-center justify-center gap-5`,
  campaignNavIcon: `px-1 cursor-pointer`,
  campaignTitle: `hidden sm:block text-lg font-bold text-[#EEF7FF] cursor-default`,
  searchContainer: `relative flex items-center w-1/3 max-w-96 h-12 rounded-lg focus-within:shadow-lg bg-[#2C2D30] overflow-hidden`,
  logoContainer: `grid place-items-center h-full w-12 text-gray-300`,
  logoIcon: `w-5 h-5`,
  searchInput: `peer h-full w-full outline-none text-sm text-[#EEF7FF] bg-transparent pr-2`,
  primaryButton: `w-11/12 sm:w-80 h-fit flex items-center justify-center text-center text-md font-semibold text-[#EEF7FF]  px-4 py-4 mx-1 rounded-md capitalize bg-[#2C2D30] bg-opacity-100 hover:bg-opacity-70 transition-opacity duration-100 ease-in-out`,
  campaignBodyWrapper: `w-full h-fit flex flex-col items-center justify-center gap-5 sm:gap-10 rounded-2xl px-2 py-10 border-b-[1px] border-[#EEF7FF] border-opacity-5`,
  campaignBody: `w-full xl:w-8/12 h-fit grid grid-cols-1 lg:grid-cols-2 justify-items-center gap-4 mx-auto px-4`,
};

const previewItem: ICreateCampaign = {
  title: "",
  description: "",
  target: "",
  deadline: "",
  image: "",
};
const StartACampaign = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ICreateCampaign>(previewItem);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();



  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (fieldName === "target") {
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
    }

    setForm({ ...form, [fieldName]: e.target.value });
  };

  useEffect(() => {
    console.log(form, "form");
  }, [form]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    checkIfImage(form.image, async (exists: any) => {
      if(exists) {
        setIsLoading(true)
        // await createCampaign({ ...form, target: ethers.utils.parseUnits(form.target, 18)})
        setIsLoading(false);
        push('/');
      } else {
        alert('Provide valid image URL')
        setForm({ ...form, image: '' });
      }
    })
  }


  return (
    <section className={styles.campaign}>
      <div className={styles.campaignHeaderWrapper}>
        <div className={styles.campaignHeader}>
          <div className={styles.campaignNav}>
            <Link href="/dashboard" className={styles.campaignNavIcon}>
              <BsArrowLeftSquareFill color="#EEF7FF" size={24} />
            </Link>
            <div className={styles.campaignTitle}>Start Campaign</div>
          </div>
          {/* <button className={styles.primaryButton}>Create Campaign</button> */}
        </div>
      </div>
      <div className={styles.campaignBodyWrapper}>
        <form onSubmit={handleSubmit} className={styles.campaignBody}>
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
          />
          <FormField
            labelName="Target Amount *"
            placeholder="Set a target"
            inputType="number"
            value={form.target}
            handleChange={(e) => handleFormFieldChange("target", e)}
          />
          <FormField
            labelName="Description *"
            placeholder="Write your story"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange("description", e)}
          />
          <FormField
            labelName="Deadline *"
            placeholder="Select the deadline"
            inputType="date"
            value={""}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
          />
          <FormField
            labelName="Add an image *"
            placeholder="Place image URL of your campaign"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleFormFieldChange("image", e)}
          />
        </form>
        <button className={styles.primaryButton}>Create Campaign</button>
      </div>
      {/* <Loader/> */}
    </section>
  );
};

export default StartACampaign;
