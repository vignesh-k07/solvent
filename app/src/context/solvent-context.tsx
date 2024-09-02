"use client";

import { SolventFundraiser } from "@/types/solvent_fundraiser";
import { SOLVENT_PROGRAM_INTERFACE } from "@/utils/constants";
import {
  Program,
  AnchorProvider,
  BN,
  web3,
  ProgramAccount,
} from "@coral-xyz/anchor";
import { WalletAdapterProps } from "@solana/wallet-adapter-base";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
//ts-ignore
import React, {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type SolventContextProviderProps = {
  children: React.ReactNode;
};

type Theme = "dark" | "light";

export interface ICreateCampaign {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

type SolventContextValue = {
  theme: Theme;
  makePaymentForRentExemption: (
    toAccount: Keypair,
    lamports: number
  ) => Promise<string>;
  createCampaign: (data: ICreateCampaign) => Promise<any>;
  getCampaigns: () => Promise<any>;
  mountedRef: MutableRefObject<boolean>;
};

export const SolventContext = createContext<SolventContextValue | null>(null);

export default function SolventContextProvider({
  children,
}: SolventContextProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  // Define reference for tracking component mounted state.
  const mountedRef = useRef(false);

  // Effect for tracking mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  //solana wallet and contract functions
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const wallet = useAnchorWallet(); //wallet for sign and pay
  const { connection } = useConnection(); //connection for send transaction

  //send sol for getMinimumBalanceForRentExemption
  const makePaymentForRentExemption = async (
    toAccount: Keypair,
    lamports: number
  ) => {
    if (!publicKey || !signTransaction || !connection || !sendTransaction) {
      throw new Error("Missing required parameters.");
    }
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toAccount.publicKey,
        lamports,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
    return signature;
  };

  //create campaign
  const createCampaign = async (campaignData: ICreateCampaign) => {
    if (
      !wallet ||
      !connection ||
      !signTransaction ||
      !publicKey ||
      !campaignData
    ) {
      throw new Error("Missing required parameters.");
    }

    const campaignAccount = Keypair.generate();

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });

    const program = new Program(
      SOLVENT_PROGRAM_INTERFACE,
      provider
    ) as Program<SolventFundraiser>;

    const lamportsforRentExemption =
      await connection.getMinimumBalanceForRentExemption(
        program.account.campaign.size
      );

    // Fund the campaign account
    await makePaymentForRentExemption(
      campaignAccount,
      lamportsforRentExemption
    );

    const initAccounts = {
      campaign: campaignAccount.publicKey,
      payer: wallet.publicKey,
      system_program: web3.SystemProgram.programId,
    };

    const targetInLamportsBn = new BN(
      Number(campaignData.target) * LAMPORTS_PER_SOL
    );

    const deadlineBn = new BN(new Date(campaignData.deadline).getTime());

    const txn = await program.methods
      .createCampaign(
        campaignData.title,
        campaignData.description,
        targetInLamportsBn,
        deadlineBn,
        campaignData.image
      )
      .accounts(initAccounts)
      .signers([campaignAccount])
      .rpc();

    return txn;
  };

  //get campaigns
  const getCampaigns = async (): Promise<any> => {
    if (!wallet || !connection) {
      console.log("getCampaigns. Missing required parameters.");
      return;
    }

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });

    if (!provider) return;

    const program = new Program(
      SOLVENT_PROGRAM_INTERFACE,
      provider
    ) as Program<SolventFundraiser>;

    // Fetch the campaign details using the public key
    const campaigns = (await program.account.campaign.all()).map((el) => ({
      publicKey: el.publicKey.toString(), // Convert PublicKey to string
      ...el.account, // Spread the account properties directly
    }));
    return campaigns;
  };

  return (
    <SolventContext.Provider
      value={{
        theme,
        makePaymentForRentExemption,
        createCampaign,
        getCampaigns,
        mountedRef,
      }}
    >
      {children}
    </SolventContext.Provider>
  );
}

export const useSolventContext = () => {
  const context = useContext(SolventContext);
  if (!context) {
    throw new Error(
      "SolventContext should be used within SolventContextProvider"
    );
  }
  return context;
};
