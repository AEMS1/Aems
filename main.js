let walletAddress = null;
let tokens = [];

document.getElementById("connectWallet").onclick = async () => {
  try {
    const resp = await window.solana.connect();
    walletAddress = resp.publicKey.toString();
    document.getElementById("walletAddress").innerText = "Wallet: " + walletAddress;
    tokens = await getTokens();
    populateTokenDropdowns();
  } catch (err) {
    alert("Wallet connection failed!");
  }
};

function populateTokenDropdowns() {
  const from = document.getElementById("fromToken");
  const to = document.getElementById("toToken");
  tokens.forEach(t => {
    const opt1 = document.createElement("option");
    opt1.value = t.address;
    opt1.innerText = t.symbol;
    from.appendChild(opt1);
    const opt2 = opt1.cloneNode(true);
    to.appendChild(opt2);
  });
}

document.getElementById("swapBtn").onclick = async () => {
  if (!walletAddress) return alert("Connect wallet first!");
  const fromMint = document.getElementById("fromToken").value;
  const toMint = document.getElementById("toToken").value;
  const amountFloat = parseFloat(document.getElementById("fromAmount").value);
  if (isNaN(amountFloat) || amountFloat <= 0) return alert("Enter a valid amount");
  const decimals = tokens.find(t => t.address === fromMint).decimals;
  const amount = Math.floor(amountFloat * 10 ** decimals);

  const route = await getSwapRoute(fromMint, toMint, amount);
  if (!route) return alert("No route found");

  try {
    const tx = await createSwapTransaction(walletAddress, route);
    const signed = await window.solana.signTransaction(tx);
    const conn = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
    const txid = await conn.sendRawTransaction(signed.serialize());
    await conn.confirmTransaction(txid);
    document.getElementById("status").innerText = "Swap successful! TXID: " + txid;
  } catch (err) {
    console.error(err);
    alert("Swap failed: " + err.message);
  }
};

