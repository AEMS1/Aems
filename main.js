const connectButton = document.getElementById("connectButton");
const swapButton = document.getElementById("swapButton");
const fromTokenSelect = document.getElementById("fromToken");
const toTokenSelect = document.getElementById("toToken");
const amountInInput = document.getElementById("amountIn");
const info = document.getElementById("info");
const priceInfo = document.getElementById("priceInfo");
const FEE_RECEIVER = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";

let provider, signer, account;

window.onload = () => {
  tokenList.forEach(token => {
    const option1 = document.createElement("option");
    option1.value = token.address;
    option1.text = token.symbol;
    fromTokenSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = token.address;
    option2.text = token.symbol;
    toTokenSelect.appendChild(option2);
  });
};

connectButton.onclick = async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    account = await signer.getAddress();
    connectButton.innerText = "متصل شد: " + account.slice(0, 6) + "...";
  } else {
    alert("لطفاً متامسک را نصب کنید!");
  }
};

swapButton.onclick = async () => {
  const amountIn = parseFloat(amountInInput.value);
  const fromToken = tokenList.find(t => t.address === fromTokenSelect.value);
  const toToken = tokenList.find(t => t.address === toTokenSelect.value);

  if (!fromToken || !toToken || !amountIn) return alert("مقادیر نامعتبر");

  const router = new ethers.Contract(
    "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    ["function swapExactTokensForTokens(uint,uint,address[],address,uint) external returns (uint[])"],
    signer
  );

  const tokenContract = new ethers.Contract(
    fromToken.address,
    ["function approve(address,uint256) external returns (bool)", "function transfer(address,uint256) external returns (bool)"],
    signer
  );

  const decimals = fromToken.decimals;
  const amountInWei = ethers.utils.parseUnits(amountIn.toString(), decimals);

  const fee = amountInWei.mul(15).div(100000); // 0.015%
  const netAmount = amountInWei.sub(fee);

  await tokenContract.approve(router.address, amountInWei);
  await tokenContract.transfer(FEE_RECEIVER, fee);

  const path = [fromToken.address, toToken.address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  await router.swapExactTokensForTokens(
    netAmount,
    0,
    path,
    account,
    deadline
  );

  info.innerText = "✅ معامله انجام شد!";
};

amountInInput.oninput = async () => {
  const fromToken = tokenList.find(t => t.address === fromTokenSelect.value);
  const toToken = tokenList.find(t => t.address === toTokenSelect.value);
  const amount = parseFloat(amountInInput.value);

  if (!fromToken || !toToken || !amount) return;

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fromToken.symbol.toLowerCase()},${toToken.symbol.toLowerCase()}&vs_currencies=usd`);
    const json = await res.json();
    const fromPrice = json[fromToken.symbol.toLowerCase()].usd;
    const toPrice = json[toToken.symbol.toLowerCase()].usd;
    const expected = (amount * fromPrice) / toPrice;
    const fee = amount * 0.00015;
    const received = expected - fee;

    priceInfo.innerText = `قیمت تقریبی: ${expected.toFixed(6)} ${toToken.symbol} | فی: ${fee.toFixed(6)} | دریافتی: ${received.toFixed(6)} ${toToken.symbol}`;
  } catch (err) {
    priceInfo.innerText = "❌ دریافت قیمت ممکن نیست.";
  }
};