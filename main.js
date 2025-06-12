
import {
  Jupiter, RouteMap, createJupiterApiClient,
  TOKEN_LIST_URL, getTokenList
} from '@jup-ag/core';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getPhantomWallet } from "@solana/wallet-adapter-wallets";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const feeAccount = new PublicKey("3ZGPouCp4sPkvZS7ZfjmzWFMKRHCJCsgtmsmLrEuV2Hz");
let wallet, jupiter, tokens;

document.getElementById("connect").onclick = async () => {
  const provider = window.phantom?.solana;
  if (!provider) return alert("Phantom not installed");
  await provider.connect();
  wallet = provider.publicKey;

  tokens = await (await fetch("https://token.jup.ag/all")).json();
  populateTokenDropdowns(tokens);
};

function populateTokenDropdowns(tokens) {
  const inSelect = document.getElementById("tokenIn");
  const outSelect = document.getElementById("tokenOut");
  tokens.forEach(token => {
    const optIn = new Option(token.symbol, token.address);
    const optOut = new Option(token.symbol, token.address);
    inSelect.add(optIn);
    outSelect.add(optOut);
  });
}

document.getElementById("amountIn").oninput = async () => {
  const inMint = document.getElementById("tokenIn").value;
  const outMint = document.getElementById("tokenOut").value;
  const amount = parseFloat(document.getElementById("amountIn").value);

  if (!amount || isNaN(amount)) return;

  const inputToken = tokens.find(t => t.address === inMint);
  const amountIn = amount * (10 ** inputToken.decimals);

  const quote = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inMint}&outputMint=${outMint}&amount=${Math.floor(amountIn)}&feeBps=60`);
  const data = await quote.json();
  const outToken = tokens.find(t => t.address === outMint);
  document.getElementById("amountOut").value = (data.outAmount / (10 ** outToken.decimals)).toFixed(6);
};

document.getElementById("swap").onclick = async () => {
  alert("Swapping is disabled in demo version.");
};
