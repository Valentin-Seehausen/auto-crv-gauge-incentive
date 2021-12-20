const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { changeBalance } = require("./changeBalance.js");

describe("Swap", function () {
  it("Should set balance and swap", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const [wallet1] = await ethers.getSigners();
    const BribeFactory = await ethers.getContractFactory("BribeFactory");
    const bribeFactory = await BribeFactory.deploy();

    await changeBalance(DAI_ADDRESS, wallet1.address, "110000");

    // create BribeAutomation
    // Test Balance of BribeV2
    // bribe()
    // Text Balance of BribeV2
  });
});
