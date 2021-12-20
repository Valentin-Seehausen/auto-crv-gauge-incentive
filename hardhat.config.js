/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.6",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/eqEtxSkYHEolyYdi68mSJl6zgaeMDLcP",
        blockNumber: 13817850,
      },
    },
  },
};
