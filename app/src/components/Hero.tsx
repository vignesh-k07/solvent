import Link from "next/link";
import React from "react";

const styles = {
  hero: `w-full h-screen bg-[url(../../public/images/curve.png)] bg-[#2C2D30] bg-opacity-10 bg-center bg-contain bg-no-repeat flex flex-col items-center justify-start gap-4 px-2 py-5 md:py-10`,
  heroTitle: `font-bold text-[50px] md:text-[80px] text-[#7695FF] text-opacity-90 text-center mt-20 md:mt-32`,
  heroTagline: `font-epilogue font-semibold text-[25px] md:text-[50px] text-[#EEF7FF] text-center`,
  heroDescription: `font-epilogue  font-medium text-[15px] md:text-[30px] text-[#EEF7FF] text-center`,
  primaryButton: `w-fit h-fit text-center text-md font-semibold text-[#EEF7FF]  px-4 py-2 rounded-md capitalize bg-[#2C2D30] bg-opacity-100 hover:bg-opacity-70 transition-opacity duration-100 ease-in-out`,
};

const Hero = () => {
  return (
    <div className={styles.hero}>
      <h1 className={styles.heroTitle}>Solvent</h1>
      <div className={styles.heroTagline}>
        Easy, Transparent Fundraising for Everyone
      </div>
      <div className={styles.heroDescription}>
        Effortless Donation Matching for Maximum Impact.
      </div>
      <Link href="/dashboard" className={styles.primaryButton}>Get Started</Link>
    </div>
  );
};

export default Hero;
