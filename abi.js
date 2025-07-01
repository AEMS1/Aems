
const contractAddress = "0xae85d873adaf9616836909b13aabf2addecad7cd";
const tokenAddress = "0x259115680169276d0e4286ACBa362460456697C5";

const contractABI = [
  {
    "inputs": [],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": ["uint256"],
    "name": "submitWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const tokenABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];
