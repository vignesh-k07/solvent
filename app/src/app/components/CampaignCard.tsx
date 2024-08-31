import { formatCurrency } from "@/utils/constants";
import { web3 } from "@coral-xyz/anchor";
import Image from "next/image";
import React from "react";
import { FaDonate } from "react-icons/fa";
import BN from "bn.js"; // Import BN

const styles = {
  card: `w-full sm:w-80 h-fit min-h-80 flex flex-col gap-2 rounded-lg bg-purple-500 bg-opacity-5 transition-opacity duration-100 ease-in-out cursor-pointer`,
  imageContainer: `relative w-full h-2/3 flex items-center justify-center overflow-hidden `,
  image: `w-full h-full object-cover object-center rounded-lg hover:scale-110 transition-transform duration-500 ease-in-out`,
  floatingInfoContainer: `absolute left-2 bottom-2 w-fit h-fit flex items-center justify-around gap-2 text-[#01A95C] px-4 py-1 rounded-md capitalize bg-[#2C2D30] backdrop-blur-sm bg-opacity-50 transition-opacity duration-100 ease-in-out`,
  floatingInfoIcon: `w-4 h-4`,
  floatingInfoText: `w-fit h-fit text-[#EEF7FF] text-sm font-semibold`,
  detailsContainer: `w-full h-full px-2 py-2 rounded-md flex flex-col gap-2`,
  title: `w-fit h-full flex items-center text-left text-md font-semibold text-[#EEF7FF]`,
  progressContainer: `w-full h-fit flex flex-col items-start justify-between gap-4`,
  progressBarWrapper: `w-full h-fit flex items-center justify-between gap-2 bg-[#EEF7FF] rounded-md`,
  progressBar: `w-1/2 h-2 bg-[#01A95C] rounded-md`,
  progressText: `w-fit h-fit text-center text-sm font-semibold text-[#EEF7FF] hover:text-[#A3D8FF] capitalize`,
};

export interface CampaignCardProps {
  title: string;
  description: string;
  targetAmount: BN;
  currentAmount: BN;
  status: string;
  creator: web3.PublicKey;
  image: string;
}

interface IProps {
  campaign: CampaignCardProps;
}

const CampaignCard = ({ campaign }: IProps) => {

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {
          //eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image ?? "https://dl.openseauserdata.com/cache/originImage/files/49499cddba4d6d445125043f2592eb7b.png"}
            alt="campaignImage"
            className={styles.image}
          />
        }
        <div className={styles.floatingInfoContainer}>
          <FaDonate className={styles.floatingInfoIcon} />
          <div className={styles.floatingInfoText}>12 Donations</div>
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <h3 className={styles.title}>{campaign.title}Innovative Solar Panel Innovative Solar Panel</h3>
        <div className={styles.progressContainer}>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBar}></div>
          </div>
          <div className={styles.progressText}>{`$${formatCurrency(campaign.currentAmount.toNumber())} raised out of ${`$${formatCurrency(campaign.targetAmount.toNumber())}`}`}</div>
        </div>  
      </div>
    </div>
  );
};

export default CampaignCard;
