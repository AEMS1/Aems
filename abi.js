const CONTRACT_ADDRESS = "0xab8cbbba46ebc7ae38b6be977b774f3dc42c4262";
const contractABI = [
    {
      "inputs": [
        { "internalType": "address", "name": "_tokenAddress", "type": "address" },
        { "internalType": "address", "name": "_ownerWallet", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "getTopUsers30Days",
      "outputs": [
        { "internalType": "address[3]", "name": "", "type": "address[3]" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTopUsers60Days",
      "outputs": [
        { "internalType": "address[3]", "name": "", "type": "address[3]" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resetAuction30Days",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resetAuction60Days",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }],
      "name": "enterAuction30Days",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }],
      "name": "enterAuction60Days",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "payEntranceFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isUserActive",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUserAccessExpireTime",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllParticipants30Days",
      "outputs": [
        {
          "components": [
            { "internalType": "address", "name": "wallet", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
          ],
          "internalType": "struct Auction.Participant[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllParticipants60Days",
      "outputs": [
        {
          "components": [
            { "internalType": "address", "name": "wallet", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
          ],
          "internalType": "struct Auction.Participant[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_amsFee", "type": "uint256" }],
      "name": "setAmsEntryFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_bnbMin30", "type": "uint256" },
        { "internalType": "uint256", "name": "_bnbMin60", "type": "uint256" }
      ],
      "name": "setMinimumBNBs",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_reward30", "type": "uint256" },
        { "internalType": "uint256", "name": "_reward60", "type": "uint256" }
      ],
      "name": "setDisplayedRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
