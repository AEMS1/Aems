
let web3;
let account;

// آدرس PancakeSwap Router v2 روی شبکه BSC
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const routerAbi = [{
  "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
  "type": "function",
  "inputs": [
    {"name":"amountIn","type":"uint256"},
    {"name":"amountOutMin","type":"uint256"},
    {"name":"path","type":"address[]"},
    {"name":"to","type":"address"},
    {"name":"deadline","type":"uint256"}
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
}];

// آدرس کیف پول مالک برای دریافت کارمزد
const ownerAddress = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById('wallet-address').innerText = account;
  } else {
    alert("Please install MetaMask!");
  }
}

function loadTokens() {
  const fromTokenSelect = document.getElementById("from-token");
  const toTokenSelect = document.getElementById("to-token");
  tokenList.forEach(token => {
    const optionFrom = document.createElement("option");
    optionFrom.value = token.address;
    optionFrom.innerText = token.symbol;
    fromTokenSelect.appendChild(optionFrom);

    const optionTo = document.createElement("option");
    optionTo.value = token.address;
    optionTo.innerText = token.symbol;
    toTokenSelect.appendChild(optionTo);
  });
}

async function swap() {
  const fromToken = document.getElementById("from-token").value;
  const toToken = document.getElementById("to-token").value;
  const amountIn = document.getElementById("from-amount").value;

  if (!account || !web3) {
    alert("Please connect wallet first.");
    return;
  }

  const tokenIn = new web3.eth.Contract([{"name":"approve","type":"function","inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable"}], fromToken);

  const decimals = 18;
  const amount = web3.utils.toBN(web3.utils.toWei(amountIn, 'ether'));

  // محاسبه کارمزد 0.6%
  const fee = amount.mul(web3.utils.toBN(6)).div(web3.utils.toBN(1000));
  const netAmount = amount.sub(fee);

  // ارسال کارمزد به مالک
  const tokenTransfer = new web3.eth.Contract([{"name":"transfer","type":"function","inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable"}], fromToken);
  await tokenTransfer.methods.transfer(ownerAddress, fee).send({ from: account });

  // approve به router
  await tokenIn.methods.approve(routerAddress, netAmount).send({ from: account });

  // swap واقعی
  const router = new web3.eth.Contract(routerAbi, routerAddress);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 دقیقه
  await router.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
    netAmount,
    0,
    [fromToken, toToken],
    account,
    deadline
  ).send({ from: account });

  alert("Swap successful!");
}

window.onload = () => {
  loadTokens();
};
