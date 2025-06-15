window.getWallet = async function () {
  if (window.ethereum) return "metamask";
  return null;
};