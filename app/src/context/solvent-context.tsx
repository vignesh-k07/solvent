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
import { format } from "path";
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

export interface ICampaign {
  publicKey: string;
  owner: PublicKey;
  title: string;
  description: string;
  target: number;
  deadline: number;
  amountCollected: number;
  totalMatched: number;
  image: string;
  donators: string[];
  donations: string[];
  status: string;
}

type SolventContextValue = {
  theme: Theme;
  mountedRef: MutableRefObject<boolean>;
  campaigns: ICampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<ICampaign[]>>;
  makePayment: (
    toAccount: Keypair,
    lamports: number
  ) => Promise<string>;
  createCampaign: (data: ICreateCampaign) => Promise<any>;
  getCampaigns: () => Promise<ICampaign[]>;
  donateToCampaign: (
    campaignAccount: PublicKey,
    owner: PublicKey,
    amount: number
  ) => Promise<string>;
  initializeGlobalPool?: () => Promise<string>;
};

export const SolventContext = createContext<SolventContextValue | null>(null);

export default function SolventContextProvider({
  children,
}: SolventContextProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

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
  const makePayment = async (
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

  //initialize global pool
  const initializeGlobalPool = async () => {
    if (!wallet || !connection || !signTransaction || !publicKey) {
      throw new Error("Missing required parameters.");
    }

    try {
      const globalPoolAccount = Keypair.generate();

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });

    const program = new Program(
      SOLVENT_PROGRAM_INTERFACE,
      provider
    ) as Program<SolventFundraiser>;

    const lamports = 0.1 * LAMPORTS_PER_SOL;

    // Fund the campaign account
    await makePayment(
      globalPoolAccount,
      lamports
    );

    const initAccounts = {
      globalPool: globalPoolAccount.publicKey,
      payer: provider.wallet.publicKey,
      system_program: SystemProgram.programId,
    };

    const initTokenAmountBn = new BN(0.05 * LAMPORTS_PER_SOL);

    const txnInstruction = await program.methods
      .initializeGlobalPool(initTokenAmountBn)
      .accounts(initAccounts)
      .signers([globalPoolAccount]).instruction();

      const transaction = new Transaction().add(txnInstruction);
      console.log("Global pool initialized:");

  // Send transaction
    const signature = await provider.sendAndConfirm(transaction, [globalPoolAccount]);

       return signature;
    } catch (error: any) {
      console.log(error);
      return error.message;
    }
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
    await makePayment(
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

    const txnInstruction = await program.methods
      .createCampaign(
        campaignData.title,
        campaignData.description,
        targetInLamportsBn,
        deadlineBn,
        campaignData.image
      )
      .accounts(initAccounts)
      .signers([campaignAccount])
      .instruction();

      const transaction = new Transaction().add(txnInstruction);

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

    let formattedCampaigns = campaigns.map((el) => {
      return {
        publicKey: el.publicKey,
        owner: el.owner,
        title: el.title,
        description: el.description,
        target: el.target.toNumber(),
        deadline: el.deadline.toNumber(),
        amountCollected: el.amountCollected.toNumber(),
        totalMatched: el.totalMatched.toNumber(),
        image: el.image,
        donators: el.donators.map((el) => el.toString()),
        donations: el.donations.map((el) => el.toString()),
        status: el.status,
      };
    });

    return formattedCampaigns;
  };

  //donate to campaign
  const donateToCampaign = async (
    campaignAccount: PublicKey,
    owner: PublicKey,
    amount: number
  ) => {
    if (!wallet || !connection || !signTransaction || !publicKey) {
      throw new Error("Missing required parameters.");
    }

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });

    const program = new Program(
      SOLVENT_PROGRAM_INTERFACE,
      provider
    ) as Program<SolventFundraiser>;

    const [globalPoolPDA, _] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global-pool")], // A seed to derive the PDA
      program.programId
    );

    const initAccounts = {
      campaign: campaignAccount,
      donor: wallet.publicKey,
      globalPool: globalPoolPDA,
      owner: new PublicKey(owner),
      system_program: SystemProgram.programId,
    };

    const donateAmountBn = new BN(Number(amount) * LAMPORTS_PER_SOL);

    const txn = await program.methods
      .donateToCampaign(donateAmountBn)
      .accounts(initAccounts)
      .signers([])
      .rpc();

      return txn;
  };
  return (
    <SolventContext.Provider
      value={{
        theme,
        mountedRef,
        campaigns,
        setCampaigns,
        makePayment,
        createCampaign,
        getCampaigns,
        donateToCampaign,
        initializeGlobalPool
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
