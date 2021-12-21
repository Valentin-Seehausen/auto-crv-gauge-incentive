const { expect } = require("chai");
const { ethers } = require("hardhat");
const { changeBalance } = require("./lib/changeBalance.js");

describe("Bribe period", function () {
  it("Should be reverted when update period is set", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const MIM_GAUGE_ADDRESS = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
    const AMOUNT_PER_VOTE = ethers.utils.parseUnits("100");
    const FILL_AMOUNT = ethers.utils.parseUnits("1000");
    const WEEK = 60 * 60 * 24 * 7;

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

    // Fill up BribeAutomation
    await dai.approve(bribeAutomationAddress, FILL_AMOUNT);
    await bribeAutomation.fill(FILL_AMOUNT);

    // First brite in period 1 should succeed
    await bribeAutomation.bribe();

    // Second bribe in period 1 should fail
    await expect(bribeAutomation.bribe()).to.be.revertedWith(
      "already bribed in this period"
    );

    // move to period 2 (one week ahead)
    await ethers.provider.send("evm_increaseTime", [WEEK]);
    await ethers.provider.send("evm_mine");

    // First bribe in period 2 should succeed
    await bribeAutomation.bribe();

    // Second bribe in period 2 should fail
    await expect(bribeAutomation.bribe()).to.be.revertedWith(
      "already bribed in this period"
    );

    // In total two bribes should have taken place
    await expect(await bribeAutomation.balance()).to.equal(
      ethers.BigNumber.from(FILL_AMOUNT)
        .sub(AMOUNT_PER_VOTE)
        .sub(AMOUNT_PER_VOTE)
    );
  });
});
