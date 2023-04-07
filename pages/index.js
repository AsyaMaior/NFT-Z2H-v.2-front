import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { NFT_CONTRACT_ADDRESS, abi } from "constants";
import { Contract, providers, ethers } from "ethers";
import { useState, useEffect, useRef } from "react";
import { Web3Button } from "@web3modal/react";
import { fetchSigner, getContract, getProvider, getAccount } from "@wagmi/core";
import { useAccount } from "wagmi";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [nfts, setNfts] = useState(0);
  const [nftArray, setNftArray] = useState([]);
  const [nftNumber, setNftNumber] = useState("");
  const [accountStatus, setAccountStatus] = useState(false);

  const renderBlock = () => {
    if (accountStatus) {
      return (
        <>
          <h3>&nbsp;</h3>
          <p>
            You can mint some kind of NFT or select a specific nft from the
            gallery. <br /> You can mint only one NFT for address!
          </p>
          <button className={styles.button} onClick={mintByLine}>
            Mint by queue
          </button>
          <p>
            Input NFT number:
            <input
              className={styles.input}
              type="number"
              step="1"
              min="0"
              max="16"
              id="number"
              onChange={(e) => updateNftNumber(e.target.value)}
            />
            <button className={styles.button} onClick={mintByTokenId}>
              Mint by number
            </button>
          </p>
          <p>Your number of nfts: {nfts}</p>
        </>
      );
    }
    return <p>You need connect a wallet</p>;
  };

  async function getNfts() {
    try {
      const provider = getProvider();

      console.log(provider);
      const nftContract = getContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: abi,
        signerOrProvider: provider,
      });
      console.log(nftContract);
      let newNfts = [];
      const totalSupplyHex = await nftContract.totalSupply();
      const totalSupply = Number(totalSupplyHex);
      console.log(totalSupply);
      for (let i = 0; i < totalSupply; i++) {
        const nftNumberHex = await nftContract.tokenByIndex(i);
        const nftNumber = Number(nftNumberHex);
        newNfts.push(nftNumber);
      }
      setNftArray(newNfts);
    } catch (error) {
      console.error(error);
    }
  }

  async function getBalanceNft() {
    try {
      const signer = await fetchSigner();

      console.log(signer);
      const nftContract = getContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: abi,
        signerOrProvider: signer,
      });
      console.log(nftContract);
      const address = await signer.getAddress();
      const nftBalance = Number(await nftContract.balanceOf(address));
      console.log(nftBalance);
      setNfts(nftBalance);
    } catch (error) {
      console.error(error);
    }
  }

  const mintByLine = async () => {
    try {
      const signer = await fetchSigner();

      console.log(signer);
      const nftContract = getContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: abi,
        signerOrProvider: signer,
      });
      console.log(nftContract);
      await nftContract.mintByLine({
        value: ethers.utils.parseEther("0.0015"),
      });
      getNfts();
      getBalanceNft();
    } catch (error) {
      console.error(error);
    }
  };

  function updateNftNumber(number) {
    setNftNumber(number);
    console.log(nftNumber);
  }

  const mintByTokenId = async () => {
    try {
      const signer = await fetchSigner();
      console.log(signer);
      const nftContract = getContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: abi,
        signerOrProvider: signer,
      });
      console.log(nftContract);
      const tokenId = Number(nftNumber);
      console.log(tokenId);
      await nftContract.mintByTokenId(tokenId, {
        value: ethers.utils.parseEther("0.0015"),
      });
      getNfts();
      getBalanceNft();
    } catch (error) {
      console.error(error);
    }
  };

  const isMinted = (id) => {
    if (nftArray.includes(Number(id), 0)) {
      return <p>NFT has already been minted!</p>;
    }
  };

  function NFTGallery() {
    let content = [];
    for (let i = 0; i < 17; i++) {
      content.push(<NFTCard id={`${i}`} />);
    }
    return <div className={styles.grid}>{content}</div>;
  }

  function NFTCard({ id }) {
    let baseURI = "ipfs://QmZDXP7ECTjmgzKaPfpv56WBFMFf1T1pKn4PrCKGkYKJ4i/";
    baseURI = baseURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    let fullURI = `${baseURI}${id}.png`;
    return (
      <>
        <div className={styles.card}>
          <img src={fullURI} width="235" />
          <div align="center">
            <h4>
              <b>Nocturnal creature {id}</b>
            </h4>
            {isMinted(id)}
          </div>
        </div>
      </>
    );
  }

  useEffect(() => {
    getNfts();
    if (getAccount().isConnected) {
      getBalanceNft();
      setAccountStatus(true);
    }
    if (getAccount().isDisconnected) {
      setNfts(0);
      setAccountStatus(false);
    }
  });

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description} align="center">
          <p>NFT Collection dApp</p>
          <div>
            <Web3Button icon="show" label="Connect Wallet" balance="show" />
          </div>
        </div>
        <div className={styles.mintblock}>{renderBlock()}</div>

        <div>
          <h3 align="center">NFT Gallery "Nocturnal creatures"</h3>
          <NFTGallery />
        </div>
      </main>
    </>
  );
}
