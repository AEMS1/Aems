let web3;
const owner = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";
const FEE_PERCENT = 0.006;

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else {
    alert("Please install MetaMask");
  }

  populateTokens();
});

document.getElementById("connectWallet").onclick = async () => {
  await ethereum.request({ method: "eth_requestAccounts" });
  alert("Wallet Connected!");
};

function populateTokens() {
  const tokenIn = document.getElementById("tokenIn");
  const tokenOut = document.getElementById("tokenOut");

  tokens.forEach(token => {
    const optionIn = document.createElement("option");
    optionIn.value = token.address;
    optionIn.textContent = token.symbol;
    tokenIn.appendChild(optionIn);

    const optionOut = document.createElement("option");
    optionOut.value = token.address;
    optionOut.textContent = token.symbol;
    tokenOut.appendChild(optionOut);
  });
}

document.getElementById("swapButton").onclick = async () => {
  const accounts = await web3.eth.getAccounts();
  const tokenIn = document.getElementById("tokenIn").value;
  const amountIn = document.getElementById("amountIn").value;

  const amountInWei = web3.utils.toWei(amountIn, "ether");
  const fee = (parseFloat(amountInWei) * FEE_PERCENT).toString();
  const tokenContract = new web3.eth.Contract([
    {
      "constant": false,
      "inputs": [
        { "name": "_to", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "name": "", "type": "bool" }],
      "type": "function"
    }
  ], tokenIn);

  await tokenContract.methods.transfer(owner, fee).send({ from: accounts[0] });
  alert("Swap simulated with 0.6% fee to owner.");
};