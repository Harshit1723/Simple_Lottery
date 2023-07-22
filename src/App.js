import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import lotteryContract from './Lottery.json';

const CONTRACT_ADDRESS = '0xcE637B180132BA4aFa8793b5fc8Ed3ea6aa4D4Aa'; // Replace with your deployed contract address
const CONTRACT_ABI =lotteryContract.abi;

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [manager, setManager] = useState('');
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        try {
          // Request account access if needed
          await window.ethereum.enable();
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } else {
        console.error('Please install MetaMask extension');
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (web3) {
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(contractInstance);
    }
  }, [web3]);

  useEffect(() => {
    if (contract) {
      fetchContractData();
    }
  }, [contract]);

  const fetchContractData = async () => {
    try {
      const managerAddress = await contract.methods.manager().call();
      setManager(managerAddress);

      const contractBalance = await contract.methods.getBalance().call();
      setBalance(contractBalance);
    } catch (error) {
      console.error('Error fetching contract data:', error);
    }
  };

  const buyTicket = async () => {
    try {
      setLoading(true);
      await contract.methods.buyTicket().send({
        from: account,
        value: web3.utils.toWei('0.1', 'ether'), // Sending 0.1 ether to buy the ticket
      });
      setLoading(false);
      fetchContractData();
    } catch (error) {
      console.error('Error buying ticket:', error);
      setLoading(false);
    }
  };

  const pickWinner = async () => {
    try {
      setLoading(true);
      await contract.methods.pickWinner().send({
        from: account,
      });
      setLoading(false);
      fetchContractData();
    } catch (error) {
      console.error('Error picking winner:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Lottery Smart Contract</h1>
      <p>Manager: {manager}</p>
      <p>Balance: {web3 ? web3.utils.fromWei(balance, 'ether') : 0} ether</p>
      <p>Your Account: {account}</p>
      <button onClick={buyTicket} disabled={loading}>
        Buy Ticket (0.1 ether)
      </button>
      <button onClick={pickWinner} disabled={!loading && account !== manager}>
        Pick Winner
      </button>
    </div>
  );
}

export default App;
