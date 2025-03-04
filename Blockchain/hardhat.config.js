require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: {
        mnemonic: "stock square tell basic monitor march cable symptom bless melt equal rubber"
      },
      saveDeployments: true,
      gas: 6000000,         // Gas limit
      gasPrice: 20000000000
    }
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    deployments: "./deployments",
    tests: "./test",
    cache: "./cache",
}
  
};
