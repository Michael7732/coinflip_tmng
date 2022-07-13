import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import Color from "color";
import { faTrophy, faSadTear } from "@fortawesome/free-solid-svg-icons";

import { Button } from "./Button";
import { ConnectButton } from "./ConnectButton";
import { Eth } from "./Eth";
import { NumberInput } from "./NumberInput";
import { useWallet } from "../hooks/useWallet";
import { useAppContext } from "../AppContext";
import { useCoinFlipContract, useMngContrct, useCoinFlipEventContract } from "../hooks/useContract";
import { ReactComponent as EthereumLogo } from "../ethereumLogo.svg";
import { COINFLIP_ADDRESS } from "../constants";
import Web3 from 'web3';

const StyledCoin = styled.button`
  height: 7.1rem;
  width: 7.1rem;
  border-radius: 50%;
  border: 0;
  background-color: ${({ theme }) => theme.colors.complementary};
  color: white;
  font-size: 3.3rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-right: ${({ marginRight, theme }) => (marginRight ? `${theme.space.l}px` : undefined)};
  cursor: pointer;
  outline: 0;
  translate: transform 150ms ease-in-out, background-color 150ms ease-in-out;
  &:hover {
    transform: scale(1.1);
    background-color: ${({ theme }) => Color(theme.colors.complementary).darken(0.2).toString()};
  }
`;

const ApproveButton = styled.button`
  border: none;
  outline: none;
  padding: 10px 30px;
  background-color: black;
  color: white;
  margin: 10px 0;
  border-radius: 5px;
  font-size: 18px;
`;

const StyledCoinWrapper = styled.div`
  display: flex;
  margin-top: ${({ theme }) => `${theme.space.m}px`};
  margin-bottom: ${({ theme }) => `${theme.space.m}px`};
`;

const TailsCoin = ({ onClick }) => {
  return <StyledCoin onClick={onClick}>Ξ</StyledCoin>;
};

const HeadsCoin = ({ onClick }) => {
  return (
    <StyledCoin onClick={onClick} marginRight>
      <EthereumLogo />
    </StyledCoin>
  );
};

export const Game = () => {
  const { isActive, account, library } = useWallet();
  const { balance, profit, getBalance, addNotification, getProfit } = useAppContext();
  const contract = useCoinFlipEventContract();
  const coinflipContract = useCoinFlipContract();
  const mngContract = useMngContrct();
  const [betAmount, setBet] = useState(100);
  const [ allowed, setAllowed ] = useState(false);
  const betChoice = 0;

  useEffect(() => {
    if (mngContract) {
      mngContract.methods.allowance(account, COINFLIP_ADDRESS).call().then(res => {
        if (res !== '0') {
          setAllowed(true);
        }
      });
    }
  }, [ mngContract ]);

  useEffect(() => {
    if (coinflipContract) {
      coinflipContract.events.BetResult()
      .on('data', function(event) {
        if (event.returnValues.player === account) {
          let win = event.returnValues.victory;
          addNotification({
            title: win ? `You won ${betAmount * 2} TMNG!` : `You lost ${betAmount} TMNG. Let's try again!`,
            icon: win ? faTrophy : faSadTear,
            isSuccess: win,
            isError: !win,
          });
        }
      });
    }
  }, [ coinflipContract ]);

  const doFlip = () => {
    if (parseInt(betAmount) < 10 || parseInt(betAmount) > 1000) {
      alert('Plese input a valid value.');
      return;
    }
    const web3 = new Web3(library.provider);
    coinflipContract.methods.bet(betChoice, web3.utils.toWei(betAmount.toString(), 'ether')).send({ from: account }).then(res => {
      getBalance();
      getProfit();
    }).catch(err => {
      console.log('error: ', err);
    });
  }
  const collectFunds = () => {
    coinflipContract.methods.withdrawPlayerBalance().send({ from: account }).then(res => {
      getBalance();
      getProfit();
    }).catch(err => {
      console.log('error: ', err);
    });
  }

  if (!isActive || !account) {
    return <ConnectButton block>Connect your wallet to start</ConnectButton>;
  }

  if (!contract) {
    return <p>Could not connect to the contract</p>;
  }

  const handleApprove = () => {
    const web3 = new Web3(library.provider);
    mngContract.methods.approve(COINFLIP_ADDRESS, web3.utils.toWei('10000000000', 'ether')).send({ from: account }).then(res => {
      setAllowed(true);
    }).catch(err => {
      console.log('error: ', err);
    })
  }

  return (
    <div>
      <h2>Hi, {account.substring(0, 5) + "..." + account.substring(account.length - 5)}</h2>
      <p>Ready to make some money? Enter the amount to bet and the coin side.</p>
      <p>Good luck!</p>
      <p
        style={{
          fontStyle: "italic",
          fontSize: "0.7em",
          opacity: 0.91,
        }}
      >
        Note: the result might take up to a few minutes. Just go grab a coffee and relax, you will get notified once the
        flip is over. In the meantime, you can play as many coins as you want!
      </p>
      <p>
        Account balance: <Eth>{balance}</Eth> <br />
        Your profit: <Eth>{profit}</Eth> {profit && profit !== "0.0" && <Button onClick={collectFunds}>Collect</Button>}
      </p>
      <NumberInput onChange={setBet} value={betAmount} />
      <p
        style={{
          marginTop: 2,
          fontStyle: "italic",
          fontSize: "0.7em",
          opacity: 0.91,
        }}
      >
        Bet range: 10 - 1000 TMNG.
      </p>
      { allowed ?
        <StyledCoinWrapper>
          <HeadsCoin betChoice={0} onClick={doFlip} />
          <TailsCoin betChoice={1} onClick={doFlip} />
        </StyledCoinWrapper> :
        <ApproveButton onClick={handleApprove}>Approve</ApproveButton>
      }
    </div>
  );
};
