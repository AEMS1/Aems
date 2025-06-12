const BASE = "https://quote-api.jup.ag";

async function getTokens() {
  const res = await fetch(BASE + "/v6/tokens");
  const json = await res.json();
  return json.tokens.slice(0, 50); // محدود به ۵۰ توکن برتر
}

async function getSwapRoute(from, to, amount) {
  const res = await fetch(\`\${BASE}/v6/quote?inputMint=\${from}&outputMint=\${to}&amount=\${amount * 1e6}&slippageBps=60\`);
  const json = await res.json();
  return json.data[0];
}

async function createSwapTransaction(wallet, route) {
  const res = await fetch(BASE + "/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route,
      userPublicKey: wallet,
      wrapUnwrapSOL: true,
      dynamicComputeUnitLimit: true,
      feeAccount: "3ZGPouCp4sPkvZS7ZfjmzWFMKRHCJCsgtmsmLrEuV2Hz"
    })
  });
  const json = await res.json();
  return new Uint8Array(json.swapTransaction.data);
}

async function sendTransaction(signedTx) {
  const conn = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
  const txid = await conn.sendRawTransaction(signedTx.serialize());
  await conn.confirmTransaction(txid);
  return txid;
}
