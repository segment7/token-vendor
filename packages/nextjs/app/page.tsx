"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Token Vendor</span>
            <span className="block text-xl font-bold">(EVM Bootcamp teamwork project for Group 9)</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            {connectedAddress ? (
              <>
                <p className="my-2 font-medium">Connected Address:</p>
                <Address address={connectedAddress} />
              </>
            ) : (
              <>
                <p className="my-2 font-medium">Connect your wallet to get started:</p>
                <appkit-button />
              </>
            )}
          </div>

          <div className="flex items-center flex-col flex-grow pt-5">
            <div className="px-5">
              <div className="flex flex-col items-center justify-center">
                <div className="max-w-3xl">
                  <p className="text-center text-lg mt-2">
                    An Ethereum-based decentralized application (dApp) demo that allows users to seamlessly buy and sell ERC-20 tokens (Token G9) in exchange for ETH.
                  </p>
                  
                </div>
                <Image
                  src="/system-architecture.png"
                  width="727"
                  height="231"
                  alt="challenge banner"
                  className="rounded-xl border-4 border-primary"
                />
                <p className="text-center text-lg">
                    🌟 Find our source code on{" "}
                    <a href="https://github.com/segment7/token-vendor" target="_blank" rel="noreferrer" className="underline">
                      Github
                    </a>{" "}
                    !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
