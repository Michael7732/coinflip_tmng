import React, { useEffect, useState } from "react";

import { Button } from "./Button";
import { Eth } from "./Eth";
import { useAppContext } from "../AppContext";
import { useWallet } from "../hooks/useWallet";
import { NumberInput } from "./NumberInput";
import { useCoinFlipContract } from "../hooks/useContract";
import Web3 from 'web3';

const useOwnerAddress = () => {
  const contract = useCoinFlipContract();
  const [ownerAddress, setOwnerAddress] = useState(null);

  useEffect(() => {
    if (!contract) {
      return;
    }
    contract.methods.owner().call().then(res => setOwnerAddress(res));
  }, [contract]);

  return ownerAddress;
};

export const Admin = () => {
  const contract = useCoinFlipContract();
  const { account, library } = useWallet();
  const [deposit, setDeposit] = useState(1);
  const { contractBalance } = useAppContext();
  const ownerAddress = useOwnerAddress();
  const coinflipContract = useCoinFlipContract();
  const isOwner = ownerAddress && ownerAddress === account;

  const doDeposit = () => {
    const web3 = new Web3(library.provider);

    coinflipContract.methods.deposit(web3.utils.toWei(deposit.toString(), 'ether')).send({ from: account }).then(res => {
      getBalance();
      alert('Successfully deposited.');
    }).catch(err => {
      console.log('error: ', err);
    });
  }

  const doWithdrawAll = () => {
    coinflipContract.methods.withdrawContractBalance().send({ from: account }).then(res => {
      getBalance();
      alert('Successfully withdrew all balances.');
    }).catch(err => {
      console.log('error: ', err);
    });
  }

  if (!contract || !isOwner) {
    return null;
  }

  return (
    <div>
      <hr style={{ marginTop: 20, marginBottom: 20, opacity: 0.34 }} />
      <h2>Hi Boss!</h2>
      <p>
        Game balance: <Eth>{contractBalance}</Eth>
        <br />
        Deposit: <NumberInput onChange={setDeposit} value={deposit} /> <Button onClick={doDeposit}>Confirm</Button>
        <br />
        <Button onClick={doWithdrawAll}>Withdraw all</Button>
      </p>
    </div>
  );
};
