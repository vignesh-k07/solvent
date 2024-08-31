import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/crowdfunding.json";

// MongoDB URI
export const MONGODB_URI = process.env.MONGODB_URI ?? "";

// JWT Secret and Expiration
export const JWT_SECRET = process.env.JWT_SECRET ?? "solvent123";
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "24h";

// Helium RPC Endpoints
export const HELIUM_RPC_ENDPOINT_MAINNET = process.env.HELIUM_RPC_ENDPOINT_MAINNET ?? clusterApiUrl("mainnet-beta");
// export const HELIUM_RPC_ENDPOINT_DEVNET = process.env.HELIUM_RPC_ENDPOINT_DEVNET ?? clusterApiUrl("devnet");
export const HELIUM_RPC_ENDPOINT_DEVNET = clusterApiUrl();


// Deployed "Solvent Fundraier" Program ID and Interface  
export const SOLVENT_PROGRAM_ID = new PublicKey(idl.address);
export const SOLVENT_PROGRAM_INTERFACE = JSON.parse(JSON.stringify(idl));


export function formatCurrency(amount: number): string {
    // Ensure the number is finite
    if (!isFinite(amount)) {
        throw new Error("Input must be a finite number.");
    }

    // Format the number with commas and two decimal places
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}