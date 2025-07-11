// main.js - Final version with contract connection and auction logic

const CONTRACT_ADDRESS = "0xab8cbbba46ebc7ae38b6be977b774f3dc42c4262";
const AMS_TOKEN_ADDRESS = "0x887ada8fe79740b913De549f81014f37e2f8D07a";
const OWNER_ADDRESS = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";

const web3 = new Web3(window.ethereum);
let userAccount = null;
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
const amsToken = new web3.eth.Contract([{
  "constant": true,
  "inputs": [{"name": "_owner", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"name": "balance", "type": "uint256"}],
  "type": "function"
}, {
  "constant": false,
  "inputs": [
    {"name": "_spender", "type": "address"},
    {"name": "_value", "type": "uint256"}
  ],
  "name": "approve",
  "outputs": [{"name": "success", "type": "bool"}],
  "type": "function"
}], AMS_TOKEN_ADDRESS);

async function connectWallet() {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0];
    document.getElementById("wallet-address").innerText = userAccount;
    document.getElementById("auction-panel").style.display = "block";
    checkUserAccess();
  } else {
    alert("MetaMask not detected.");
  }
}

async function checkUserAccess() {
  const isActive = await contract.methods.isUserActive().call({ from: userAccount });
  if (!isActive) {
    document.getElementById("access-fee-panel").style.display = "block";
    document.getElementById("auction-sections").style.display = "none";
  } else {
    document.getElementById("access-fee-panel").style.display = "none";
    document.getElementById("auction-sections").style.display = "block";
    loadAuctionParticipants();
  }
}

async function payAccessFee() {
  const feeAmount = web3.utils.toWei("1500", 'ether');
  await amsToken.methods.approve(CONTRACT_ADDRESS, feeAmount).send({ from: userAccount });
  await contract.methods.payEntranceFee().send({ from: userAccount });
  checkUserAccess();
}

async function enterAuction(days) {
  const inputId = days === 30 ? "bid-30" : "bid-60";
  const value = parseFloat(document.getElementById(inputId).value);
  if (value < 0.001) {
    alert("Minimum BNB required not met.");
    return;
  }
  const method = days === 30 ? "enterAuction30Days" : "enterAuction60Days";
  await contract.methods[method](web3.utils.toWei(value.toString(), 'ether')).send({
    from: userAccount,
    value: web3.utils.toWei(value.toString(), 'ether')
  });
  loadAuctionParticipants();
}

async function loadAuctionParticipants() {
  const [list30, list60] = await Promise.all([
    contract.methods.getAllParticipants30Days().call(),
    contract.methods.getAllParticipants60Days().call()
  ]);
  renderTable(list30, "table-30");
  renderTable(list60, "table-60");
}

function renderTable(participants, tableId) {
  const table = document.getElementById(tableId);
  table.innerHTML = "";
  participants.sort((a, b) => b.amount - a.amount);
  participants.slice(0, 355).forEach((p, i) => {
    const row = `<tr><td>${i + 1}</td><td>${p.wallet}</td><td>${web3.utils.fromWei(p.amount, 'ether')} BNB</td></tr>`;
    table.innerHTML += row;
  });
}

// Admin functions (only visible for owner wallet)
async function setAmsFee() {
  const value = document.getElementById("input-ams-fee").value;
  await contract.methods.setAmsEntryFee(web3.utils.toWei(value, 'ether')).send({ from: userAccount });
}

async function setBnbMinimums() {
  const min30 = document.getElementById("min-bnb-30").value;
  const min60 = document.getElementById("min-bnb-60").value;
  await contract.methods.setMinimumBNBs(
    web3.utils.toWei(min30, 'ether'),
    web3.utils.toWei(min60, 'ether')
  ).send({ from: userAccount });
}

async function setRewards() {
  const reward30 = document.getElementById("reward-30").value;
  const reward60 = document.getElementById("reward-60").value;
  await contract.methods.setDisplayedRewards(reward30, reward60).send({ from: userAccount });
}

async function resetAuction(days) {
  const method = days === 30 ? "resetAuction30Days" : "resetAuction60Days";
  await contract.methods[method]().send({ from: userAccount });
  loadAuctionParticipants();
}

// Auto-run
window.addEventListener("load", async () => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      userAccount = accounts[0];
      document.getElementById("wallet-address").innerText = userAccount;
      checkUserAccess();
    }
  }
});
