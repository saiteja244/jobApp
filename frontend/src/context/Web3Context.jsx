import { createContext, useState, useContext } from 'react';
import { ethers } from 'ethers';
import JobPortalABI from '../contracts/JobPortal.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const HARDHAT_CHAIN_ID = '0x7A69'; // 31337 in hex

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    setConnecting(true);
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it from metamask.io');
        return;
      }

      // Check which network MetaMask is on
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      console.log('Current chain ID:', chainId);

      // If not on Hardhat local network, ask MetaMask to switch
      if (chainId !== HARDHAT_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: HARDHAT_CHAIN_ID }],
          });
        } catch (switchError) {
          // If the network doesn't exist in MetaMask yet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: HARDHAT_CHAIN_ID,
                  chainName: 'Hardhat Local',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Request wallet access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        JobPortalABI.abi,
        signer
      );

      // Test the contract by calling a simple view function
      const jobCount = await contractInstance.jobCount();
      console.log('Contract connected! Job count:', jobCount.toString());

      setAccount(accounts[0]);
      setContract(contractInstance);

      return { signer, contract: contractInstance };
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const postJobOnChain = async (title, company) => {
    if (!contract) throw new Error('Wallet not connected');

    try {
      // Use hardcoded fee of 0.01 ETH
      const fee = ethers.parseEther('0.01');
      console.log('Posting job on chain...');
      console.log('Title:', title);
      console.log('Company:', company);
      console.log('Fee:', ethers.formatEther(fee), 'ETH');

      const tx = await contract.postJob(title, company, { value: fee });
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed!');
      console.log('Transaction hash:', receipt.hash);

      return receipt.hash;
    } catch (error) {
      console.error('Blockchain post error:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        contract,
        connecting,
        connectWallet,
        postJobOnChain,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used inside Web3Provider');
  return context;
};