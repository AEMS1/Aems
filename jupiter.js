const BASE = "https://quote-api.jup.ag";

async function getTokens() {
  const res = await fetch(BASE + "/v6/tokens");
  const json = await res.json();
  return json.tokens.slice(0, 50);
}

async function getSwapRoute(from, to, amount) {
  const res = await fetch(
    `${BASE}/v6/quote?inputMint=${from}&outputMint=${to}&amount=${amount}&slippageBps=60`
  );
  const json = await res.json();
  return json.data?.[0];
}

async function createSwapTransaction(publicKey, route) {
  const res = await fetch(BASE + "/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route,
      userPublicKey: publicKey,
      wrapUnwrapSOL: true,
      dynamicComputeUnitLimit: true,
      feeAccount: "3ZGPouCp4sPkvZS7ZfjmzWFMKRHCJCsgtmsmLrEuV2Hz"
    })
  });
  const json = await res.json();
  return solanaWeb3.Transaction.from(Buffer.from(json.swapTransaction.data, 'base64'));
}
