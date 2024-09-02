import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/solvent_fundraiser.json";
import jwt from "jsonwebtoken";
import { BN, web3 } from "@coral-xyz/anchor";

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


export const formatWalletAddress = (address: string): string => {
  if (address.length <= 4) {
    return address; // Return the original address if it's too short to truncate
  }
  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}..${end}`;
};


export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const daysLeft = (deadlineBn: BN) => {
    // Get the current time in milliseconds as a BN instance
    const currentTimeBn = new BN(Date.now());

    // Calculate the difference in milliseconds
    const differenceBn = deadlineBn.sub(currentTimeBn);

    // Convert the difference to days
    const remainingDays = differenceBn.div(new BN(1000 * 3600 * 24)); // Milliseconds in a day

    // Return the remaining days as a number
    return remainingDays.toNumber(); // Convert BN back to a number
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

  export const generateRandomBase58Hash = (length = 16) => {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let hash = '';
    for (let i = 0; i < length; i++) {
      hash += ALPHABET[Math.floor(window.crypto.getRandomValues(new Uint8Array(1))[0] % ALPHABET.length)];
    }
    return hash;
  }
  


  //check if the token matches the wallet
  export const checkIftheTokenMatchesTheWallet = async (wallet: string, jwtToken: string) => {
      const decodedToken = jwt.decode(jwtToken);
      //@ts-ignore
      if (decodedToken?.publicKey !== wallet) {
        return false;
      } else {
        return true;
      }
  };