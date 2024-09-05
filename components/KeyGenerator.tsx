"use client";
import React, { useState, useEffect } from "react";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import { FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";
import TokenGenerator from "./TokenGenerator";

const SolanaKeyGenerator: React.FC = () => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [inputPrivateKey, setInputPrivateKey] = useState<string>("");
  const [visible, setVisible] = useState(false);

  const generateKeypair = () => {
    const keypair = Keypair.generate();
    const publicKeyString = keypair.publicKey.toBase58();
    const privateKeyBase58 = bs58.default.encode(keypair.secretKey);

    localStorage.setItem("solanaPublicKey", publicKeyString);
    localStorage.setItem("solanaPrivateKey", privateKeyBase58);

    setPublicKey(publicKeyString);
    setPrivateKey(privateKeyBase58);
  };

  const retrieveKeypair = () => {
    const storedPublicKey = localStorage.getItem("solanaPublicKey");
    const storedPrivateKey = localStorage.getItem("solanaPrivateKey");

    if (storedPublicKey && storedPrivateKey) {
      setPublicKey(storedPublicKey);
      setPrivateKey(storedPrivateKey);
    }
  };

  const toggleVisibility = () => {
    if (visible) {
      setVisible(false);
      return;
    } else {
      setVisible(true);
      return;
    }
  };

  useEffect(() => {
    retrieveKeypair();
  }, []);

  const handlePrivateKeyInput = () => {
    try {
      const privateKeyArray = bs58.default.decode(inputPrivateKey);

      const keypair = Keypair.fromSecretKey(privateKeyArray);

      setPublicKey(keypair.publicKey.toBase58());
      setPrivateKey(bs58.default.encode(keypair.secretKey));

      localStorage.setItem("solanaPublicKey", keypair.publicKey.toBase58());
      localStorage.setItem(
        "solanaPrivateKey",
        bs58.default.encode(keypair.secretKey)
      );

      setInputPrivateKey("");
    } catch (error) {
      alert("Invalid private key format. Please input a valid base58 key.");
    }
  };
  const handleDeleteKeypair = () => {
    localStorage.removeItem("solanaPrivateKey");
    localStorage.removeItem("solanaPublicKey");
    localStorage.removeItem("solanaWallets");
    setPublicKey("");
    setPrivateKey("");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Create Token on Solana</h1>
      {!publicKey ? (
        <div className="md:mt-10 mt-20 text-center">
          <button
            className="bg-black text-white hover:bg-gray-600 px-4 py-4 text-xl font-semibold rounded-xl"
            onClick={generateKeypair}
          >
            Generate New Keypair
          </button>
          <h1 className="mt-6 text-semibold">Or</h1>
          <div className="mt-6">
            <input
              className="border border-gray-400 rounded-lg p-2 w-3/4 md:w-1/2"
              type="password"
              placeholder="Enter your private key (in base58 format)"
              value={inputPrivateKey}
              onChange={(e) => setInputPrivateKey(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 font-semibold rounded-xl ml-2 mt-8 md:ml-4 md:mt-0"
              onClick={handlePrivateKeyInput}
            >
              Import Keypair
            </button>
          </div>
        </div>
      ) : (
        <div className="">
          <div
            className="p-2 md:p-4 md:pl-8 my-4 border border-gray-300 rounded-lg
          mt-8 md:w-[80%] md:ml-48"
          >
            <p className="font-medium mt-6 text-lg">Public key</p>
            <p className="w-[200px] md:w-full truncate overflow-hidden text-ellipsis">
              {publicKey}
            </p>
            <p className="font-medium text-lg mt-2">Private key</p>
            <div className="flex justify-between">
              <p className="w-[200px] md:w-[90%] truncate overflow-hidden text-ellipsis">
                {visible
                  ? privateKey
                  : "************************************************************************************"}
              </p>
              <button
                className="ml-2 text-gray-600 hover:text-gray-800"
                onClick={() => toggleVisibility()}
              >
                {visible ? <FaEyeSlash /> : <FaEye />}
              </button>{" "}
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDeleteKeypair()}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <TokenGenerator privateKey={privateKey} />
        </div>
      )}
    </div>
  );
};

export default SolanaKeyGenerator;
