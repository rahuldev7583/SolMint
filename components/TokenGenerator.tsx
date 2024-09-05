"use client";
import React, { useState } from "react";
import { Keypair, Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import * as bs58 from "bs58";
import Image from "next/image";

const connection = new Connection(clusterApiUrl("devnet"));

interface TokenGeneratorProps {
  privateKey: string | null;
}

interface MintInfo {
  mintAddress: string;
  decimals: number;
  freezeAuthority: string | null;
}

const TokenGenerator: React.FC<TokenGeneratorProps> = ({ privateKey }) => {
  const [decimals, setDecimals] = useState<number>(6);
  const [freezeAuthority, setFreezeAuthority] = useState<string>("");
  const [amount, setAmount] = useState<number>(10);
  const [mintList, setMintList] = useState<MintInfo[]>([]);
  const [selectedMint, setSelectedMint] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateMint = async () => {
    if (!privateKey) {
      setMessage("Please provide a valid private key.");
      return;
    }

    setLoading(true);

    try {
      const payerSecretKey = bs58.default.decode(privateKey);
      const payer = Keypair.fromSecretKey(payerSecretKey);

      const mintAuthority = payer;
      const freezeAuthorityKey = freezeAuthority
        ? new PublicKey(freezeAuthority)
        : null;

      const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthorityKey,
        decimals
      );

      const newMintInfo: MintInfo = {
        mintAddress: mint.toBase58(),
        decimals,
        freezeAuthority: freezeAuthority || null,
      };

      setMintList((prev) => [...prev, newMintInfo]);
      setMessage(`Mint created at: ${mint.toBase58()}`);
      setSelectedMint(mint.toBase58());
      setShowForm(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error creating mint:", error);
      setMessage("Failed to create mint. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!privateKey) {
      setMessage("Please provide a valid private key.");
      return;
    }

    if (!selectedMint) {
      setMessage("Please select a mint address from the list.");
      return;
    }

    setLoading(true);

    try {
      const payerSecretKey = bs58.default.decode(privateKey);
      const payer = Keypair.fromSecretKey(payerSecretKey);

      const mint = new PublicKey(selectedMint);

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
      );

      await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer,
        amount *
          10 **
            (mintList.find((m) => m.mintAddress === selectedMint)?.decimals ||
              6)
      );

      setMessage(`Mint successful. Minted ${amount} tokens.`);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error minting tokens:", error);
      setMessage("Failed to mint tokens. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Loading spinner */}
      {loading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {!showForm && (
        <div className="mb-4">
          <button
            className="bg-black text-white hover:bg-gray-600 px-4 py-4 text-xl font-semibold rounded-xl md:ml-[40%]"
            onClick={() => setShowForm(true)}
          >
            Create New Mint
          </button>
        </div>
      )}

      {showForm && (
        <div className="md:w-[82%] md:ml-[175px] border border-gray-300 rounded-lg px-6 py-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-center">
              Create New Mint
            </h1>
            <label className="block font-bold mb-2">Decimals</label>
            <input
              className="w-full p-2 border rounded"
              type="number"
              placeholder="Enter number of decimals"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2">
              Freeze Authority (Optional)
            </label>
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Enter freeze authority public key (optional)"
              value={freezeAuthority}
              onChange={(e) => setFreezeAuthority(e.target.value)}
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            onClick={handleCreateMint}
            disabled={loading}
          >
            Create Mint
          </button>
        </div>
      )}

      {mintList.length > 0 && (
        <div className="mt-6  md:w-[80%] md:ml-48">
          <h2 className="text-xl font-bold mb-2">Created Mints</h2>
          <ul className="list-disc pl-5 mt-4">
            {mintList.map((mintInfo) => (
              <li key={mintInfo.mintAddress} className="mt-4">
                <button
                  className={`text-blue-500 underline ${
                    selectedMint === mintInfo.mintAddress ? "font-bold" : ""
                  }`}
                  onClick={() => setSelectedMint(mintInfo.mintAddress)}
                >
                  {mintInfo.mintAddress}
                </button>
                {mintInfo.freezeAuthority && (
                  <span> (Freeze Authority: {mintInfo.freezeAuthority})</span>
                )}
                <div className="mb-4  mt-4">
                  <label className="block font-bold mb-2">Amount to Mint</label>
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    placeholder="Amount of tokens to mint"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={handleMintTokens}
                  disabled={loading}
                >
                  Mint New Token
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default TokenGenerator;
