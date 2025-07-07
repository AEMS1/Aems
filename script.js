
let web3;
let userAccount;
const contractAddress = "0x1019d7d05b1d3b2cb7cf6927c5ce68a6edbc29dd";
const tokenAddress = "0x259115680169276d0e4286acba362460456697c5";
const abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

document.getElementById("connectBtn").onclick = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    document.getElementById("walletInfo").innerText = "Wallet: " + userAccount;
  } else {
    alert("Please install MetaMask to use this feature.");
  }
};

document.getElementById("startBtn").onclick = async () => {
  if (!userAccount) return alert("Please connect your wallet.");
  const contract = new web3.eth.Contract(abi, tokenAddress);
  try {
    await contract.methods.transfer(contractAddress, web3.utils.toWei("1000", "ether")).send({ from: userAccount });
    document.getElementById("status").innerText = "Searching for opponent...";
    document.getElementById("cancelBtn").style.display = "inline-block";
    setTimeout(() => {
      document.getElementById("status").innerText = "Opponent found. Game Started!";
      document.getElementById("gameBoard").style.display = "grid";
      createBoard();
    }, 3000);
  } catch (err) {
    alert("Transaction failed: " + err.message);
  }
};

document.getElementById("cancelBtn").onclick = () => {
  document.getElementById("status").innerText = "Search canceled.";
  document.getElementById("cancelBtn").style.display = "none";
};

function createBoard() {
  const board = document.getElementById("gameBoard");
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.onclick = () => {
      if (!cell.innerText) {
        cell.innerText = Math.random() > 0.5 ? "X" : "O";
      }
    };
    board.appendChild(cell);
  }
}
