let walletAddress = null;

document.getElementById('connectWallet').onclick = async () => {
  try {
    const resp = await window.solana.connect();
    walletAddress = resp.publicKey.toString();
    document.getElementById('walletAddress').innerText = 'Wallet: ' + walletAddress;
    loadTokens();
  } catch (err) {
    alert('Wallet connection failed!');
  }
};

async function loadTokens() {
  const tokenList = await getTokens();
  const fromToken = document.getElementById('fromToken');
  const toToken = document.getElementById('toToken');
  tokenList.forEach(token => {
    let opt = document.createElement('option');
    opt.value = token.address;
    opt.innerText = token.symbol;
    fromToken.appendChild(opt.cloneNode(true));
    toToken.appendChild(opt);
  });
}

document.getElementById('swapBtn').onclick = async () => {
  const from = document.getElementById('fromToken').value;
  const to = document.getElementById('toToken').value;
  const amount = parseFloat(document.getElementById('fromAmount').value);
  if (!walletAddress || !from || !to || !amount) return alert('Missing fields');
  try {
    const route = await getSwapRoute(from, to, amount);
    if (!route) return alert('No route found');
    const tx = await createSwapTransaction(walletAddress, route);
    const signedTx = await window.solana.signTransaction(tx);
    const result = await sendTransaction(signedTx);
    alert('Swap complete! TX: ' + result);
  } catch (err) {
    console.error(err);
    alert('Swap failed!');
  }
};
