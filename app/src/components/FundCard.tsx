import React from "react";
import tagLogo from "../../public/icons/solvent-main-logo.png";
import { daysLeft, formatWalletAddress, getRandomColor } from "../utils/constants";
import Image from "next/image";
import { BN, web3 } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { format } from "path";
import { get } from "http";
import ProfilePlaceholder from "./ProfilePlaceholder";

const data = {
  owner: "owner",
  title: "title",
  description: "description",
  target: 100,
  deadline: "100",
  amountCollected: 100,
  image:
    "https://www.rainforest-alliance.org/wp-content/uploads/2020/11/peruvian-amazon-rainforest-canopy.jpg",
};

type CampaignStatus = "Active" | "Inactive" | "Completed";

interface ICampaign {
  amountCollected: BN;
  deadline: BN;
  description: string;
  donations: BN[];
  donators: web3.PublicKey[];
  image: string;
  owner: web3.PublicKey;
  status: CampaignStatus;
  target: BN;
  title: string;
  totalMatched: BN;
}

const FundCard = ({
  amountCollected,
  deadline,
  description,
  owner,
  title,
  image,
  target,
  donations,
}: ICampaign) => {
  const remainingDays = daysLeft(deadline.toNumber());

  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <div
      className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer shadow-lg shadow-[#7A1CAC]/20 hover:shadow-[#7A1CAC]/50  hover:scale-[101%] transition-all duration-300 ease-in-out"
      onClick={handleClick}
    >
      <Image
        src={image}
        alt="fund"
        className="w-full h-[158px] object-cover rounded-[15px]"
        width={288}
        height={158}
      />

      <div className="flex flex-col p-4">
        <div className="flex flex-row items-center mb-[18px]">
          <Image
            src={tagLogo}
            alt="tag"
            className="w-[17px] h-[17px] object-contain"
            width={17}
          />
          <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#808191] bg-[#2C2D30] backdrop-blur-sm bg-opacity-50">
            {`${donations.length} donations`}
          </p>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {amountCollected.toNumber() / LAMPORTS_PER_SOL}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Raised of {target.toNumber() / LAMPORTS_PER_SOL}
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Days Left
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
            <ProfilePlaceholder/>
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">
            by{" "}
            <span className="text-[#b2b3bd]">
              {formatWalletAddress(owner.toBase58())}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
