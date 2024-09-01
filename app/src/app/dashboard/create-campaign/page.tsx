"use client";
import Link from "next/link";
import React, { useState } from "react";

import { FormField } from "@/components";
import { ICreateCampaign, useSolventContext } from "@/context/solvent-context";
import { checkIfImage, checkIftheTokenMatchesTheWallet } from "@/utils/constants";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { Oval } from "react-loader-spinner";
import { JsonWebTokenError } from "jsonwebtoken";

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
  const { createCampaign } = useSolventContext();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<ICreateCampaign>(previewItem);
  const { publicKey } = useWallet();

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
  
  const handleSubmit = async () => {
    if(!publicKey) {
      throw new Error("Wallet not connected");
    };

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please verify your wallet first");
      return;
    }

    const checkIfTokenVlaid = await checkIftheTokenMatchesTheWallet(publicKey.toBase58(), token);

    if (!checkIfTokenVlaid) {
      toast.error("Token does not match wallet");
      return;
    }

    setIsLoading(true);
    try {
      if (form.title.trim() === "" || form.title.length < 2 || form.title.length > 100) {
        toast.error("Title must be between 2 and 100 characters");
        throw new Error("Title must be between 2 and 100 characters");
      }

      if (isNaN(Number(form.target))) {
        toast.error("Target must be a number");
        setForm({ ...form, target: "" });
        return;
      }

      if (form.description.trim() === "" || form.description.length < 10 || form.description.length > 2000) {
        toast.error("Description must be between 10 and 2000 characters");
        throw new Error("Description must be between 10 and 2000 characters");
      }

      const deadline = new Date(form.deadline);

      if (deadline.getTime() < Date.now()) {
        toast.error("Deadline must be in the future");
        setForm({ ...form, deadline: "" });
        throw new Error("Deadline must be in the future");
      }

      checkIfImage(form.image, async (isValid: boolean) => {
        if (isValid) {
          console.log("Image is valid");
        } else {
          toast.error(
            "Provide valid image URL. The image could not be loaded."
          );
          setForm({ ...form, image: "" });
          throw new Error("Provide valid image URL. The image could not be loaded.");
        }
      });

      const transactionId = await createCampaign(form);
      console.log("Create Campaign: " + transactionId);
      toast.success("Campaign created successfully!");
      setIsLoading(false);
      setForm(previewItem);
      push("/");
    } catch (error: any) {
      toast.error("Error creating campaign: " + error?.message);
      console.log(error);
      setIsLoading(false);
    }
  };

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
          <Link href="/dashboard" className={styles.primaryButton}>
            Dashboard
          </Link>
        </div>
      </div>
      <div className={styles.campaignBodyWrapper}>
        <div className={styles.campaignBody}>
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
            disabled={isLoading}
          />
          <FormField
            labelName="Target Amount *"
            placeholder="Set a target in SOL"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange("target", e)}
            disabled={isLoading}
          />
          <FormField
            labelName="Description *"
            placeholder="Write your story"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange("description", e)}
            disabled={isLoading}
          />
          <FormField
            labelName="Deadline *"
            placeholder="Select the deadline"
            inputType="date"
            value={""}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
            disabled={isLoading}
          />
          <FormField
            labelName="Add an image *"
            placeholder="Place image URL of your campaign"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleFormFieldChange("image", e)}
            disabled={isLoading}
          />
        </div>
        <button
        onClick={handleSubmit}
          className={`${styles.secondaryButton} ${isLoading ? "text-opacity-70 bg-opacity-70" : "bg-opacity-100 hover:bg-opacity-70"}`}
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
          {isLoading ? "Creating Campaign..." : "Create Campaign"}
        </button>
      </div>
      {/* <Loader/> */}
    </section>
  );
};

export default StartACampaign;
