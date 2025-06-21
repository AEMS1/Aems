let web3;
let selectedAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else {
    alert("Please install MetaMask!");
    return;
  }

  loadTokens();
  document.getElementById("connectWallet").onclick = connectWallet;
  document.getElementById("swapButton").onclick = swapTokens;

  document.getElementById("tokenIn").addEventListener("change", updateRateAndBalance);
  document.getElementById("tokenOut").addEventListener("change", updateRateAndBalance);
  document.getElementById("amountIn").addEventListener("input", updateRateAndBalance);
});

async function connectWallet() {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  selectedAccount = accounts[0];
  document.getElementById("walletInfo").innerText = selectedAccount.slice(0, 6) + "..." + selectedAccount.slice(-4);
  updateRateAndBalance();
}

function loadTokens() {
  const tokenInSelect = document.getElementById("tokenIn");
  const tokenOutSelect = document.getElementById("tokenOut");

  tokens.forEach(token => {
    const optIn = document.createElement("option");
    optIn.value = token.address;
    optIn.textContent = token.symbol;
    tokenInSelect.appendChild(optIn);

    const optOut = document.createElement("option");
    optOut.value = token.address;
    optOut.textContent = token.symbol;
    tokenOutSelect.appendChild(optOut);
  });
}

async function updateRateAndBalance() {
  const from = document.getElementById("tokenIn").value;
  const to = document.getElementById("tokenOut").value;
  const amount = document.getElementById("amountIn").value;

  const tokenIn = tokens.find(t => t.address === from);
  const tokenOut = tokens.find(t => t.address === to);

  // نمایش موجودی
  if (selectedAccount && tokenIn) {
    const tokenContract = new web3.eth.Contract([
      {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
      }
    ], tokenIn.address);

    const balance = await tokenContract.methods.balanceOf(selectedAccount).call();
    const formatted = parseFloat(balance / (10 ** tokenIn.decimals)).toFixed(6);
    document.getElementById("balanceIn").innerText = Your Balance: ${formatted} ${tokenIn.symbol};
  }

  if (!amount || isNaN(amount)) return;

  const router = new web3.eth.Contract([
    {
      "name": "getAmountsOut",
      "outputs": [{ "name": "", "type": "uint256[]" }],
      "inputs": [
        { "name": "amountIn", "type": "uint256" },
        { "name": "path", "type": "address[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ], "0x10ED43C718714eb63d5aA57B78B54704E256024E"); // PancakeSwap V2

  const amountInWei = web3.utils.toBN(amount * (10 ** tokenIn.decimals));
  try {
    const path = [tokenIn.address, tokenOut.address];
    const result = await router.methods.getAmountsOut(amountInWei, path).call();
    const amountOut = result[1] / (10  tokenOut.decimals);
    document.getElementById("amountOut").value = amountOut.toFixed(6);
  } catch (err) {
    document.getElementById("amountOut").value = "Error";
  }
}

async function swapTokens() {
  const from = document.getElementById("tokenIn").value;
  const to = document.getElementById("tokenOut").value;
  const amount = document.getElementById("amountIn").value;

  const tokenIn = tokens.find(t => t.address === from);
  const amountInWei = web3.utils.toBN(amount * (10  tokenIn.decimals));

  const fee = amountInWei.mul(web3.utils.toBN(6)).div(web3.utils.toBN(1000)); // 0.6%
  const realAmount = amountInWei.sub(fee);

  const router = new web3.eth.Contract([
    {
      "name": "swapExactTokensForTokens",
      "outputs": [{ "name": "", "type": "uint256[]" }],
"inputs": [
        { "name": "amountIn", "type": "uint256" },
        { "name": "amountOutMin", "type": "uint256" },
        { "name": "path", "type": "address[]" },
        { "name": "to", "type": "address" },
        { "name": "deadline", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ], "0x10ED43C718714eb63d5aA57B78B54704E256024E");

  const tokenContract = new web3.eth.Contract([
    {
      "name": "approve",
      "inputs": [
        { "name": "_spender", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "type": "function"
    },
    {
      "name": "transfer",
      "inputs": [
        { "name": "_to", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "type": "function"
    }
  ], tokenIn.address);

  await tokenContract.methods.approve(router.options.address, amountInWei.toString()).send({ from: selectedAccount });
  await tokenContract.methods.transfer("0xec54951C7d4619256Ea01C811fFdFa01A9925683", fee.toString()).send({ from: selectedAccount });

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const path = [from, to];
  await router.methods.swapExactTokensForTokens(
    realAmount.toString(),
    1,
    path,
    selectedAccount,
    deadline
  ).send({ from: selectedAccount });
}// A full Web3 + PancakeSwap swap logic with 0.6% fee from input (code will be included in zip)
