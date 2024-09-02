"use client";
import React from "react";

import { useParams, useSearchParams } from "next/navigation";

const DonateToCampaogn = () => {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const campaign = searchParams.get("campaign");

  let campaignData;
  if (campaign) {
    try {
      campaignData = JSON.parse(decodeURIComponent(campaign));
    } catch (error) {
      console.error("Failed to parse campaign data:", error);
    }
  }

  return  <div>
      {/* Render your campaign data */}
      {campaignData && <div>{campaignData.title}</div>}
    </div>;
};

export default DonateToCampaogn;
