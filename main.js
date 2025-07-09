const connectButton = document.getElementById("connectButton");
const swapButton = document.getElementById("swapButton");
const fromTokenSelect = document.getElementById("fromToken");
const toTokenSelect = document.getElementById("toToken");
const amountInInput = document.getElementById("amountIn");
const info = document.getElementById("info");
const priceInfo = document.getElementById("priceInfo");
const receiveInfo = document.getElementById("receiveInfo");
const feeInfo = document.getElementById("feeInfo");
const FEE_RECEIVER = "0xec54951C7d4619256Ea01C811fFdFa01A9925683";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

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
    connectButton.innerText = "Connected: " + account.slice(0, 6) + "...";
  } else {
    alert("Please install MetaMask!");
  }
};

swapButton.onclick = async () => {
  try {
    const amountIn = parseFloat(amountInInput.value);
    const fromToken = tokenList.find(t => t.address === fromTokenSelect.value);
    const toToken = tokenList.find(t => t.address === toTokenSelect.value);
    if (!fromToken || !toToken || !amountIn) return alert("Invalid input");

    const decimals = fromToken.decimals;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), decimals);
    const fee = amountInWei.div(100); // 1%
    const netAmount = amountInWei.sub(fee);

    if (fromToken.symbol === "BNB") {
      const router = new ethers.Contract(
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        ["function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable external returns (uint[] memory)"],
        signer
      );

      const path = [WBNB_ADDRESS, toToken.address];
      const tx = await signer.sendTransaction({
        to: FEE_RECEIVER,
        value: fee
      });
      await tx.wait();

      await router.swapExactETHForTokens(0, path, account, Math.floor(Date.now() / 1000) + 60 * 20, {
        value: netAmount
      });
    } else {
      const tokenContract = new ethers.Contract(
        fromToken.address,
        [
          "function approve(address,uint256) external returns (bool)",
          "function transfer(address,uint256) external returns (bool)",
          "function balanceOf(address) external view returns (uint256)"
        ],
        signer
      );

      const tokenBalance = await tokenContract.balanceOf(account);
      if (tokenBalance.lt(amountInWei)) return alert("❌ Insufficient balance!");

      await tokenContract.approve("0x10ED43C718714eb63d5aA57B78B54704E256024E", netAmount);
      await tokenContract.transfer(FEE_RECEIVER, fee);

      const router = new ethers.Contract(
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        ["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory)"],
        signer
      );

      const path = [fromToken.address, toToken.address];
      await router.swapExactTokensForTokens(netAmount, 0, path, account, Math.floor(Date.now() / 1000) + 60 * 20);
    }

    info.innerText = "✅ Swap successful!";
  } catch (err) {
    console.error("Swap error:", err);
    alert("❌ Swap failed!");
  }
};

amountInInput.oninput = async () => {
  const fromToken = tokenList.find(t => t.address === fromTokenSelect.value);
  const toToken = tokenList.find(t => t.address === toTokenSelect.value);
  const amount = parseFloat(amountInInput.value);
  if (!fromToken || !toToken || !amount) return;

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fromToken.id},${toToken.id}&vs_currencies=usd`);
    const json = await res.json();
    const fromPrice = json[fromToken.id].usd;
    const toPrice = json[toToken.id].usd;

    const expected = (amount * fromPrice) / toPrice;
    const fee = expected * 0.01;
    const received = expected - fee;

    priceInfo.innerText = `${fromToken.symbol} ≈ ${fromPrice.toFixed(2)} USDT`;
    receiveInfo.innerText = `You will receive: ${received.toFixed(4)} ${toToken.symbol}`;
    feeInfo.innerText = `1% fee`;

  } catch (err) {
    priceInfo.innerText = "❌ Failed to fetch price.";
    receiveInfo.innerText = "";
    feeInfo.innerText = "";
  }
};

toTokenSelect.onchange = () => {
  const to = toTokenSelect.options[toTokenSelect.selectedIndex].text;
  const symbol = `BNB${to}`;
  const container = document.getElementById("chartContainer");
  container.innerHTML = '';
  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
  script.async = true;
  script.innerHTML = JSON.stringify({
    "symbol": `BINANCE:${symbol}`,
    "width": 350,
    "height": 220,
    "locale": "en",
    "dateRange": "1D",
    "colorTheme": "light",
    "trendLineColor": "rgba(41, 98, 255, 1)",
    "underLineColor": "rgba(41, 98, 255, 0.3)",
    "isTransparent": false,
    "autosize": false,
    "largeChartUrl": ""
  });
  container.appendChild(script);
};
