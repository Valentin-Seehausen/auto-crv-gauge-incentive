const { expect } = require("chai");
const { ethers } = require("hardhat");
const { changeBalance } = require("./lib/changeBalance.js");

describe("Bribe edge cases", function () {
  it("Should be reverted when automation balance is insufficient", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const MIM_GAUGE_ADDRESS = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
    const AMOUNT_PER_VOTE = ethers.utils.parseUnits("100");
    const FILL_AMOUNT = ethers.utils.parseUnits("10");

    // Prepare funds
    const [wallet1] = await ethers.getSigners();
    await changeBalance(DAI_ADDRESS, wallet1.address, FILL_AMOUNT);

    // Load smart contracts
    const dai = await ethers.getContractAt("erc20", DAI_ADDRESS);
    const bribeFactory = await (
      await ethers.getContractFactory("BribeFactory")
    ).deploy();

    // create BribeAutomation
    await bribeFactory.create_bribe_automation(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS,
      AMOUNT_PER_VOTE
    );
    const bribeAutomationAddress = (
      await bribeFactory.get_bribe_automations()
    )[0][0];
    const bribeAutomation = await ethers.getContractAt(
      "BribeAutomation",
      bribeAutomationAddress
    );

    // Test with insufficient funds
    await dai.approve(bribeAutomationAddress, FILL_AMOUNT);
    await bribeAutomation.fill(FILL_AMOUNT);
    await expect(bribeAutomation.bribe()).to.be.revertedWith(
      "not enough funds"
    );
  });

  it("Should be reverted when sender balance is insufficient", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const MIM_GAUGE_ADDRESS = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
    const AMOUNT_PER_VOTE = ethers.utils.parseUnits("100");
    const FILL_AMOUNT = ethers.utils.parseUnits("10");

    // Load smart contracts
    const dai = await ethers.getContractAt("erc20", DAI_ADDRESS);
    const bribeFactory = await (
      await ethers.getContractFactory("BribeFactory")
    ).deploy();

    // create BribeAutomation
    await bribeFactory.create_bribe_automation(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS,
      AMOUNT_PER_VOTE
    );
    const bribeAutomationAddress = (
      await bribeFactory.get_bribe_automations()
    )[0][0];
    const bribeAutomation = await ethers.getContractAt(
      "BribeAutomation",
      bribeAutomationAddress
    );

    // Test with insufficient funds
    await dai.approve(bribeAutomationAddress, FILL_AMOUNT);
    await expect(bribeAutomation.fill(FILL_AMOUNT)).to.be.revertedWith(
      "Dai/insufficient-balance"
    );
  });
});
