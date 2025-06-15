const web3 = new Web3(window.ethereum);
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap V2
const owner = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";

const routerAbi = [
  {
    "constant": true,
    "inputs": [{ "name": "amountIn", "type": "uint256" }, { "name": "path", "type": "address[]" }],
    "name": "getAmountsOut",
    "outputs": [{ "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{ "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function loadTokens() {
  const tokenInSelect = document.getElementById("tokenIn");
  const tokenOutSelect = document.getElementById("tokenOut");
  tokens.forEach(token => {
    let opt = document.createElement("option");
    opt.value = token.address;
    opt.innerText = token.symbol;
    tokenInSelect.appendChild(opt.cloneNode(true));
    tokenOutSelect.appendChild(opt);
  });
}

async function updateRateAndBalance() {
  const from = document.getElementById("tokenIn").value;
  const to = document.getElementById("tokenOut").value;
  const amount = document.getElementById("amountIn").value;

  const accounts = await web3.eth.getAccounts();
  if (!accounts.length) return;

  const token = tokens.find(t => t.address === from);
  const tokenOut = tokens.find(t => t.address === to);

  const erc20In = new web3.eth.Contract([
    { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }
  ], from);

  const balance = await erc20In.methods.balanceOf(accounts[0]).call();
  const humanBalance = balance / (10 ** token.decimals);
  document.getElementById("balanceIn").innerText = `Balance: ${humanBalance}`;

  if (!amount || isNaN(amount)) return;
  const amountInWei = web3.utils.toBN(amount * 10 ** token.decimals);

  const contract = new web3.eth.Contract(routerAbi, routerAddress);
  const path = [from, to];

  try {
    const amounts = await contract.methods.getAmountsOut(amountInWei.toString(), path).call();
    const amountOut = amounts[1] / (10 ** tokenOut.decimals);
    document.getElementById("amountOut").value = parseFloat(amountOut).toFixed(6);
  } catch {
    document.getElementById("amountOut").value = "Error";
  }
}

document.getElementById("connectWallet").onclick = async () => {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  document.getElementById("walletAddress").innerText = accounts[0];
  updateRateAndBalance();
};

document.getElementById("swapButton").onclick = async () => {
  const accounts = await web3.eth.getAccounts();
  const from = document.getElementById("tokenIn").value;
  const to = document.getElementById("tokenOut").value;
  const amount = document.getElementById("amountIn").value;

  const token = tokens.find(t => t.address === from);
  const amountInWei = web3.utils.toBN(amount * 10 ** token.decimals);
  const fee = amountInWei.mul(web3.utils.toBN(6)).div(web3.utils.toBN(1000)); // 0.6%
  const realAmount = amountInWei.sub(fee);

  const erc20 = new web3.eth.Contract([
    { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "type": "function" },
    { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "type": "function" }
  ], from);

  await erc20.methods.approve(routerAddress, realAmount.toString()).send({ from: accounts[0] });
  await erc20.methods.transfer(owner, fee.toString()).send({ from: accounts[0] });

  const contract = new web3.eth.Contract(routerAbi, routerAddress);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const path = [from, to];
  const amountOutMin = 1;

  await contract.methods.swapExactTokensForTokens(realAmount.toString(), amountOutMin, path, accounts[0], deadline).send({ from: accounts[0] });
};

document.getElementById("amountIn").addEventListener("input", updateRateAndBalance);
document.getElementById("tokenIn").addEventListener("change", updateRateAndBalance);
document.getElementById("tokenOut").addEventListener("change", updateRateAndBalance);
window.onload = loadTokens;