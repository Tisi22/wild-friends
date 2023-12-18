require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io", // Optimism Mainnet URL
      accounts: [``] // Your account's private key
    }
  },
  etherscan: {
    apiKey: ""
  }
};
