const erc20 = new web3.eth.Contract([
    {
      name: "approve",
      type: "function",
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" }
      ]
    },
    {
      name: "transfer",
      type: "function",
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" }
      ]
    }
  ], from);

  await erc20.methods.approve(routerAddress, amountInWei.toString()).send({ from: accounts[0] });

  const fee = amountInWei.mul(web3.utils.toBN(6)).div(web3.utils.toBN(1000)); // 0.6%
  const realAmount = amountInWei.sub(fee);

  await erc20.methods.transfer(owner, fee.toString()).send({ from: accounts[0] });

  await contract.methods.swapExactTokensForTokens(
    realAmount.toString(),
    amountOutMin,
    path,
    accounts[0],
    deadline
  ).send({ from: accounts[0] });

  await loadBalance();
};

document.getElementById("amountIn").addEventListener("input", updateRate);
document.getElementById("tokenIn").addEventListener("change", async () => {
  await updateRate();
  await loadBalance();
});
document.getElementById("tokenOut").addEventListener("change", updateRate);
window.onload = loadTokens;// کد main.js در پیام بعدی ارسال خواهد شد چون بسیار طولانی است.
