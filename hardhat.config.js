require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.6",
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMYAPI,
        blockNumber: 13817850,
      },
    },
  },
};
