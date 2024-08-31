import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";

import AppWalletProvider from "./components/AppWalletProvider";
import Appbar from "./components/Appbar";

import { Toaster } from 'react-hot-toast';

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Solvent | Web3 Fund Raising",
  description: "Web3 Fund Raising",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={chakraPetch.className}>
        <AppWalletProvider>
          <Appbar />
          {children}
          <Toaster
          position="bottom-right"
          reverseOrder={false}
          />
        </AppWalletProvider>
      </body>
    </html>
  );
}
