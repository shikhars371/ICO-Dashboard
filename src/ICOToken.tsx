import { formatUnits, formatEther, parseEther } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";

import BitFuelTokenArtifacts from "./artifacts/contracts/BitFuelToken.sol/BitFuelToken.json";
import BitFuelTokenCrowdsaleArtifacts from "./artifacts/contracts/BitFuelTokenCrowdsale.sol/BitFuelTokenCrowdsale.json";
import logger from "./logger";
import { BitFuelToken, BitFuelTokenCrowdsale } from "./types";

interface Props {
  crowdsaleAddress: string;
}

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

const providerUrl = import.meta.env.VITE_PROVIDER_URL;
const crowdsaleAddress = import.meta.env.VITE_CROWDSALE_ADDRESS;


const TokenInfo = ({ crowdsaleAddress }: { crowdsaleAddress: string }) => {

  console.log("addresssss",crowdsaleAddress,crowdsaleAddress);
  
  const { library } = useWeb3React();

  const fetchTokenInfo = async () => {
    logger.warn("fetchTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const tokenContract = new ethers.Contract(crowdsaleAddress, BitFuelTokenArtifacts.abi, provider) as BitFuelToken;
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    console.log("totalsupply",totalSupply.toString());
    
    logger.warn("token info", { crowdsaleAddress,name, symbol, decimals });
    return {
      name,
      symbol,
      decimals,
      totalSupply,
    };
  };
  const { error, isLoading, data } = useQuery(["token-info", crowdsaleAddress], fetchTokenInfo, {
    enabled: crowdsaleAddress !== "",
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className="flex flex-col">
      <button className="btn">
        {data?.name}
        <div className="ml-2 badge">{data?.symbol}</div>
        <div className="ml-2 badge badge-info">{data?.decimals}</div>
      </button>

      <div className="shadow stats">
        <div className="stat">
          <div className="stat-title">Total Supply</div>
          <div className="stat-value">{formatUnits(data?.totalSupply ?? 0,18)}</div>
        </div>
      </div>
    </div>
  );
};

async function requestAccount() {
  if (window.ethereum?.request) return window.ethereum.request({ method: "eth_requestAccounts" });

  throw new Error("Missing install Metamask. Please access https://metamask.io/ to install extension on your browser");
}

const ICOToken = ({ crowdsaleAddress }: Props) => {
  const { library, chainId, account } = useWeb3React();
  const [tokenAddress, setTokenAddress] = useState("");
  const [availableForSale, setAvailableForSale] = useState("0");
  const [price, setPrice] = useState("0");
  const [closingTime, setClosingTime] = useState("0");
  const [amount, setAmount] = useState(1);

  // fetch crowdsale token info
  const fetchCrowdsaleTokenInfo = async () => {
    logger.warn("fetchCrowdsaleTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const tokenContract = new ethers.Contract(crowdsaleAddress, BitFuelTokenArtifacts.abi, provider) as BitFuelToken;
    const totalSupply = await tokenContract.totalSupply();
    let currentSupply =  await tokenContract.circulatingSupply();
    let _tSupply = Number(formatEther(BigNumber.from(totalSupply.toString()))) ;
    let c_supply = Number(formatEther(BigNumber.from(currentSupply.toString())));
    let availableSupply = _tSupply-c_supply;
    
    setAvailableForSale(availableSupply.toString());
    await tokenContract.rate()
      .then((rate) => setPrice(BigNumber.from(rate).toString()))
      .catch(logger.error);
  };
  useEffect(() => {
    try {
      fetchCrowdsaleTokenInfo();
    } catch (error) {
      logger.error(error);
    }
  }, [library]);

  // buy token base on quantity
  const buyTokens = async () => {
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const signer = provider.getSigner();
    try {
      if (!account) {
        await requestAccount();
        return;
      }
      const txPrams = {
        to: crowdsaleAddress,
        value: ethers.BigNumber.from(parseEther(totalCost)),
      };
      logger.warn({ txPrams });
      const transaction = await signer.sendTransaction(txPrams);
      toast.promise(transaction.wait(), {
        loading: `Transaction submitted. Wait for confirmation...`,
        success: <b>Transaction confirmed!</b>,
        error: <b>Transaction failed!.</b>,
      });

      // refetch total token after processing
      transaction
        .wait()
        .then(() => fetchCrowdsaleTokenInfo())
        .catch(logger.error);
    } catch (error) {
      logger.error(error);
    }
  };

  const totalCosts = (Number(price)) * amount;
  const totalCost = formatEther((BigNumber.from(totalCosts.toString()).toString()));
  
  return (
    <div className="relative py-3 sm:max-w-5xl sm:mx-auto">
      {chainId !== 3 && (
        <>
          <div className="alert">
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#ff5722"
                className="w-6 h-6 mx-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <label>Please connect to the Ropsten testnet for testing.</label>
            </div>
          </div>
          <div className="divider"></div>
        </>
      )}

      <div className="flex items-center w-full px-4 py-10 bg-cover card bg-base-200">
        <TokenInfo crowdsaleAddress={crowdsaleAddress} />

        <div className="text-center shadow-2xl card">
          <div className="card-body">
            <h2 className="card-title">BitFuel Token</h2>
            {Number(closingTime) > 0 && (
              <div className="alert">
                <div className="flex-1">
                  Closing time
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#2196f3"
                    className="w-6 h-6 mx-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <label>{new Date(Number(closingTime) * 1000).toLocaleString()}</label>
                </div>
              </div>
            )}
            <div className="shadow stats">
              <div className="stat">
                <div className="stat-title">Available for sale</div>
                <div className="stat-value">{availableForSale}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Price</div>
                <div className="stat-value">{formatUnits(price, "ether")} eth</div>
              </div>
              <div className="stat">
                <div className="stat-title">Order Quantity</div>
                <div className="stat-value">{amount}</div>
              </div>
            </div>

            <input
              type="range"
              max="1000000"
              value={amount}
              onChange={(evt) => setAmount(evt.target.valueAsNumber)}
              className="range range-accent"
            />
            <div>
              <div className="justify-center card-actions">
                <button onClick={buyTokens} type="button" className="btn btn-outline btn-accent">
                  Buy Now
                </button>
              </div>
              <div className="badge badge-md">Total: {totalCost} ETH</div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="items-center justify-center max-w-2xl px-4 py-4 mx-auto text-xl border-orange-500 lg:flex md:flex">
          <div className="p-2 font-semibold">
            <a
              href={`https://ropsten.etherscan.io/address/${crowdsaleAddress}`}
              target="_blank"
              className="px-4 py-1 ml-2 text-white bg-orange-500 rounded-full shadow focus:outline-none"
              rel="noreferrer"
            >
              View Token on Etherscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICOToken;
