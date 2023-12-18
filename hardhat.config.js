require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.23", // Replace with your Solidity version
    settings: {
      optimizer: {
        enabled: false, // or false, depending on your optimization preference
        runs: 200
      },
      evmVersion: "london"
    }
  },
  networks: {
    optimism: {
      url: "https://optimism.llamarpc.com", // Optimism Mainnet URL
      accounts: [``] // Your account's private key
    },
  },
  etherscan: {
    apiKey: ""
  },
  customChains: [
    {
      network: 'soptimism',
      chainId: 10,
      urls: {
        browserURL: 'https://optimistic.etherscan.io/',
      },
    },
  ],
}
