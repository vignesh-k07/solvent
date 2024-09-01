import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/solvent_fundraiser.json";

// MongoDB URI
export const MONGODB_URI = process.env.MONGODB_URI ?? "";

// JWT Secret and Expiration
export const JWT_SECRET = process.env.JWT_SECRET ?? "solvent123";
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "24h";

// Helium RPC Endpoints
export const HELIUM_RPC_ENDPOINT_MAINNET =
  process.env.HELIUM_RPC_ENDPOINT_MAINNET ?? clusterApiUrl("mainnet-beta");
// export const HELIUM_RPC_ENDPOINT_DEVNET = process.env.HELIUM_RPC_ENDPOINT_DEVNET ?? clusterApiUrl("devnet");
export const HELIUM_RPC_ENDPOINT_DEVNET = clusterApiUrl();

// Deployed "Solvent Fundraier" Program ID and Interface
export const SOLVENT_PROGRAM_ID = new PublicKey(idl.address);
export const SOLVENT_PROGRAM_INTERFACE = JSON.parse(JSON.stringify(idl));

//utility functions

export function formatCurrency(amount: number): string {
  // Ensure the number is finite
  if (!isFinite(amount)) {
    throw new Error("Input must be a finite number.");
  }

  // Format the number with commas and two decimal places
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


export const formatWalletAddress = (
  address: string,
): string => {
  if (address.length <= 5 + 4) {
    return address; // Return the original address if it's too short to truncate
  }
  const start = address.slice(0, 5);
  const end = address.slice(-4);
  return `${start}...${end}`;
};


export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const daysLeft = (deadline: number) => {
    const difference = new Date(deadline).getTime() - Date.now();
    const remainingDays = difference / (1000 * 3600 * 24);
  
    return remainingDays.toFixed(0);
  };

  
export const calculateBarPercentage = (goal:number, raisedAmount:number) => {
    const percentage = Math.round((raisedAmount * 100) / goal);
  
    return percentage;
  };
  
  export const checkIfImage = (url:string, callback:Function) => {
    const img = new Image();
    img.src = url;
  
    if (img.complete) callback(true);
  
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
  };