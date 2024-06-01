import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import GameFactoryABI from '../ContractABI/GameFactory.json';

export const Web3ProviderContext = createContext(null);
const contractAddress: string = '0xd378def344b694f20d20727751d2cd1132932707';

export const GlobalWeb3StateProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [gameData, setGameData] = useState({
    name: '',
    price: '',
  });
  const [isGamePublished, setIsGamePublished] = useState(false);

  const walletConnect = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();

    if (chainId !== 97) {
      //add chain
      await provider.send('wallet_addEthereumChain', [
        {
          chainId: '0x61',
          chainName: 'BNB Smart Chain Testnet',
          rpcUrls: ['https://endpoints.omniatech.io/v1/bsc/testnet/public'],
          nativeCurrency: {
            symbol: 'tBNB',
            decimals: 18,
          },
        },
      ]);
    }
    console.log('chainId', chainId);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner(accounts[0]);

    const contract = new ethers.Contract(
      contractAddress,
      GameFactoryABI.abi,
      signer
    );
    setContractInstance(contract);

    setSigner(signer);

    setAddress(accounts[0]);
    console.log('signer', signer);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();
        if (chainId !== 97) {
          alert('this chain is not supported connect your wallet again');
        }
      });
    }

    walletConnect();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {
          console.log('this chain is not supported');
        });
      }
    };
  }, []);

  const getContractInstance = () => {
    return contractInstance;
  };
  console.log('contractInstance', contractInstance);
  return (
    <Web3ProviderContext.Provider
      value={{
        walletConnect,
        setSigner,
        signer,
        address,
        contractAddress,
        getContractInstance,
        gameData,
        setGameData,
        isGamePublished,
        setIsGamePublished,
      }}
    >
      {children}
    </Web3ProviderContext.Provider>
  );
};

export const useWeb3Context = () => useContext(Web3ProviderContext);
