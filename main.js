let account;
const provider = window.ethereum;
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const FEE_RECEIVER = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";

const routerABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

window.onload = () => {
  const fromSelect = document.getElementById("fromToken");
  const toSelect = document.getElementById("toToken");

  tokenList.forEach(token => {
    const opt1 = new Option(token.symbol, token.address);
    const opt2 = new Option(token.symbol, token.address);
    fromSelect.add(opt1);
    toSelect.add(opt2);
  });

  fromSelect.selectedIndex = 0;
  toSelect.selectedIndex = 1;

  document.getElementById("connect").onclick = connectWallet;
  document.getElementById("amount").oninput = updateEstimates;
  document.getElementById("swap").onclick = onSwap;
};

async function connectWallet() {
  if (!provider) return alert("Please install MetaMask");
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  account = accounts[0];
  document.getElementById("connect").innerText = account.slice(0, 6) + "..." + account.slice(-4);
}

async function getPrice(id) {
  const res = await fetch(https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd);
  const data = await res.json();
  return data[id].usd;
}

async function updateEstimates() {
  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || isNaN(amount)) return;

  const fromToken = tokenList[document.getElementById("fromToken").selectedIndex];
  const toToken = tokenList[document.getElementById("toToken").selectedIndex];

  const fromPrice = await getPrice(fromToken.priceId);
  const toPrice = await getPrice(toToken.priceId);

  const fee = amount * 0.00015;
  const net = amount - fee;
  const receive = (net * fromPrice) / toPrice;

  document.getElementById("fee").innerText = fee.toFixed(6);
  document.getElementById("net").innerText = net.toFixed(6);
  document.getElementById("receive").innerText = receive.toFixed(4) + " " + toToken.symbol;
}

async function onSwap() {
  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || isNaN(amount)) return alert("Invalid amount");

  const fromToken = tokenList[document.getElementById("fromToken").selectedIndex];
  const toToken = tokenList[document.getElementById("toToken").selectedIndex];
  const decimals = fromToken.decimals;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const router = new ethers.Contract(PANCAKE_ROUTER, routerABI, signer);

  const amountIn = ethers.utils.parseUnits(amount.toString(), decimals);
  const feeAmount = amountIn.mul(15).div(100000);
  const amountAfterFee = amountIn.sub(feeAmount);

  const tokenContract = new ethers.Contract(fromToken.address, [
    "function approve(address spender, uint256 value) public returns (bool)",
    "function transfer(address recipient, uint256 amount) public returns (bool)"
  ], signer);

  await tokenContract.transfer(FEE_RECEIVER, feeAmount);
  await tokenContract.approve(PANCAKE_ROUTER, amountAfterFee);

  const path = [fromToken.address, toToken.address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  await router.swapExactTokensForTokens(
    amountAfterFee,
    0,
    path,
    account,
    deadline
  );

  alert("Swap completed!");
}
