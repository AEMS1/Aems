let web3;
let userAccount;
let contract;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    document.getElementById("status").innerText = Connected: ${userAccount};
    document.getElementById("gameLobby").style.display = "block";
  } else {
    alert("Please install MetaMask.");
  }
}

document.getElementById("connectButton").onclick = connectWallet;

document.getElementById("joinGameButton").onclick = async () => {
  document.getElementById("gameStatus").innerText = "Searching for opponent...";

  setTimeout(() => {
    document.getElementById("gameStatus").innerText = "Opponent found! Game starting!";
    startGame();
  }, 3000);
};

function startGame() {
  document.getElementById("gameBoard").style.display = "block";
  document.getElementById("turnIndicator").innerText = "Your Turn";
  const board = document.getElementById("board");
  board.innerHTML = "";

  let state = Array(9).fill(null);
  let currentPlayer = "X";

  function checkWinner() {
    const wins = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (const [a,b,c] of wins) {
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        return state[a];
      }
    }
    return state.includes(null) ? null : "draw";
  }

  state.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.addEventListener("click", () => {
      if (!state[i] && !checkWinner()) {
        state[i] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);

        const winner = checkWinner();
        if (winner) {
          document.getElementById("turnIndicator").innerText =
            winner === "draw" ? "Draw!" : ${winner} wins!;
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          document.getElementById("turnIndicator").innerText =
            currentPlayer === "X" ? "Your Turn" : "Opponent Turn";
        }
      }
    });
    board.appendChild(cell);
  });
}
