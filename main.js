
let provider, signer, contract, token;
let clicks = 0;
let expectedKey = 'a';
let position = 0;
let slipperyStart = 0;
let slipperyEnd = 0;
let isSlippery = false;
const finishClicks = 35;

async function connectWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText = address;

  contract = new ethers.Contract(contractAddress, contractABI, signer);
  token = new ethers.Contract(tokenAddress, tokenABI, signer);

  // Approve tokens
  const amount = ethers.utils.parseUnits("3000", 18);
  const approveTx = await token.approve(contractAddress, amount);
  await approveTx.wait();

  const joinTx = await contract.joinGame();
  await joinTx.wait();

  startGame();
}

function startGame() {
  clicks = 0;
  position = 0;
  expectedKey = 'a';
  document.getElementById("status").innerText = "";
  document.getElementById("playerCar").style.left = "0%";
  setSlipperyZone();

  let countdown = 3;
  const countdownEl = document.getElementById("countdown");
  countdownEl.innerText = countdown;
  const timer = setInterval(() => {
    countdown--;
    if (countdown === 0) {
      clearInterval(timer);
      countdownEl.innerText = "";
      document.getElementById("status").innerText = "GO!";
    } else {
      countdownEl.innerText = countdown;
    }
  }, 1000);
}

function setSlipperyZone() {
  const range = Math.floor(finishClicks * 0.16);
  slipperyStart = Math.floor(Math.random() * (finishClicks - range));
  slipperyEnd = slipperyStart + range;
}

function handleClick(key) {
  if (clicks >= finishClicks) return;

  if (key === expectedKey) {
    clicks++;
    expectedKey = key === 'a' ? 'l' : 'a';

    if (clicks >= slipperyStart && clicks <= slipperyEnd) {
      if (!isSlippery) {
        isSlippery = true;
        document.querySelector(".race-track").classList.add("slippery-zone");
        document.getElementById("status").innerText = "You're on a slippery zone!";
      }
      if (Math.random() < 0.2) {
        document.getElementById("status").innerText = "You slipped!";
        return;
      }
    } else if (isSlippery && clicks > slipperyEnd) {
      isSlippery = false;
      document.querySelector(".race-track").classList.remove("slippery-zone");
      document.getElementById("status").innerText = "You exited the slippery zone.";
    }

    position += (100 / finishClicks);
    document.getElementById("playerCar").style.left = position + "%";

    if (clicks >= finishClicks) {
      document.getElementById("status").innerText = "🏆 You reached the finish line!";
      submitResult(1);
    }
  } else {
    document.getElementById("status").innerText = "Wrong key! Press " + expectedKey.toUpperCase();
  }
}

document.getElementById("connect").addEventListener("click", connectWallet);
document.getElementById("btnA").addEventListener("click", () => handleClick('a'));
document.getElementById("btnL").addEventListener("click", () => handleClick('l'));

async function submitResult(winner) {
  try {
    const tx = await contract.submitWinner(winner);
    await tx.wait();
    document.getElementById("status").innerText += " (Reward Sent)";
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Error submitting result.";
  }
}
