const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { changeBalance } = require("./changeBalance.js");

describe("Bribe edge cases", function () {
  it("Should be reverted when automation balance is insufficient", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const MIM_GAUGE_ADDRESS = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
    const BRIBEV2_ADDRESS = "0x7893bbb46613d7a4FbcC31Dab4C9b823FfeE1026";
    const amount_per_vote = ethers.utils.parseUnits("100");
    const fill_amount = ethers.utils.parseUnits("10");

    const bribev2 = await ethers.getContractAt("BribeV2", BRIBEV2_ADDRESS);
    const dai = await ethers.getContractAt("erc20", DAI_ADDRESS);

    const [wallet1] = await ethers.getSigners();
    const BribeFactory = await ethers.getContractFactory("BribeFactory");
    const bribeFactory = await BribeFactory.deploy();

    await changeBalance(DAI_ADDRESS, wallet1.address, fill_amount);

    // create BribeAutomation
    await bribeFactory.create_bribe_automation(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS,
      amount_per_vote
    );
    const bribeAutomationAddress = (
      await bribeFactory.get_bribe_automations()
    )[0][0];

    const bribeAutomation = await ethers.getContractAt(
      "BribeAutomation",
      bribeAutomationAddress
    );

    const bribeBalanceBefore = await bribev2.reward_per_token(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS
    );
    await dai.approve(bribeAutomationAddress, fill_amount);
    await bribeAutomation.fill(fill_amount);
    expect(bribeAutomation.bribe()).to.be.revertedWith("not enough funds");
  });

  it("Should be reverted when sender balance is insufficient", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const MIM_GAUGE_ADDRESS = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
    const BRIBEV2_ADDRESS = "0x7893bbb46613d7a4FbcC31Dab4C9b823FfeE1026";
    const amount_per_vote = ethers.utils.parseUnits("100");
    const fill_amount = ethers.utils.parseUnits("10");

    const bribev2 = await ethers.getContractAt("BribeV2", BRIBEV2_ADDRESS);
    const dai = await ethers.getContractAt("erc20", DAI_ADDRESS);

    const [wallet1] = await ethers.getSigners();
    const BribeFactory = await ethers.getContractFactory("BribeFactory");
    const bribeFactory = await BribeFactory.deploy();

    // create BribeAutomation
    await bribeFactory.create_bribe_automation(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS,
      amount_per_vote
    );
    const bribeAutomationAddress = (
      await bribeFactory.get_bribe_automations()
    )[0][0];

    const bribeAutomation = await ethers.getContractAt(
      "BribeAutomation",
      bribeAutomationAddress
    );

    const bribeBalanceBefore = await bribev2.reward_per_token(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS
    );
    await dai.approve(bribeAutomationAddress, fill_amount);
    await expect(bribeAutomation.fill(fill_amount)).to.be.revertedWith(
      "Dai/insufficient-balance"
    );
  });
});