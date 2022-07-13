import { useMemo } from "react";
import { Contract } from "@ethersproject/contracts";
import ICoinFlip from "../abis/coinFlip.json";
import mngAbi from '../abis/mng.json';
import { useWallet } from "./useWallet";
import { COINFLIP_ADDRESS, MNG_ADDRESS } from "../constants";
import Web3 from "web3";

export const useContract = (address, abi) => {
  const { library, account } = useWallet();

  return useMemo(() => {
    if (!address || !abi || !library) return null;
    try {
      const signer = library.getSigner(account);

      return new Contract(address, abi, signer);
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, abi, library, account]);
};

export const useCoinFlipEventContract = () => useContract(COINFLIP_ADDRESS, ICoinFlip);

export const useContract1 = (address, abi) => {
  const { library } = useWallet();

  return useMemo(() => {
    if (!address || !abi || !library) return null;

    try {
      const web3 = new Web3(library.provider);
      return new web3.eth.Contract(abi, address);
    } catch (err) {
      console.log('error: ', err);
      return null;
    }
  }, [ library, address, abi ]);
}

export const useCoinFlipContract = () => useContract1(COINFLIP_ADDRESS, ICoinFlip);
export const useMngContrct = () => useContract1(MNG_ADDRESS, mngAbi);