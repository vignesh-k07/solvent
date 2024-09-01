import { BN, web3 } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import tagLogo from "../../public/icons/solvent-main-logo.png";
import { daysLeft, formatWalletAddress } from "../utils/constants";
import ProfilePlaceholder from "./ProfilePlaceholder";
import prevImage from "../../public/images/prevImg.png"
import { ICampaign } from "@/app/dashboard/page";



interface IProps {
  campaign: ICampaign;
}

const FundCard = ({
  campaign
}: IProps) => {
  const remainingDays = daysLeft(campaign.deadline.toNumber());

  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <div
      className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer shadow-lg shadow-[#7C93C3]/5 hover:shadow-[#7C93C3]/10  hover:scale-[101%] transition-all duration-300 ease-in-out"
      onClick={handleClick}
    >
      <Image
        src={campaign.image ?? prevImage}
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
            {`${campaign.donations.length} donations`}
          </p>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {campaign.title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {campaign.description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {campaign.amountCollected.toNumber() / LAMPORTS_PER_SOL}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Raised of {campaign.target.toNumber() / LAMPORTS_PER_SOL}
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
              {formatWalletAddress(campaign.owner.toBase58())}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
