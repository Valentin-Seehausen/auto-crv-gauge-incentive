const { expect } = require("chai");
const { ethers } = require("hardhat");
const { changeBalance } = require("./lib/changeBalance.js");

describe("BribeFactory", function () {
  it("Should create BribeAutomation ", async function () {
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const MIM_GAUGE_ADDRESS = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
    const BRIBEV2_ADDRESS = "0x7893bbb46613d7a4FbcC31Dab4C9b823FfeE1026";
    const AMOUNT_PER_VOTE = ethers.utils.parseUnits("100");
    const FILL_AMOUNT = ethers.utils.parseUnits("1000");

    // Load funds
    const [wallet1] = await ethers.getSigners();
    await changeBalance(DAI_ADDRESS, wallet1.address, FILL_AMOUNT);

    // Load smart contracts
    const bribev2 = await ethers.getContractAt("BribeV2", BRIBEV2_ADDRESS);
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

    // Test: Fill and bribe
    await dai.approve(bribeAutomationAddress, FILL_AMOUNT);
    await bribeAutomation.fill(FILL_AMOUNT);
    const bribeBalanceBefore = await bribev2.reward_per_token(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS
    );
    await bribeAutomation.bribe();
    const bribeBalanceAfter = await bribev2.reward_per_token(
      MIM_GAUGE_ADDRESS,
      DAI_ADDRESS
    );
    // Values had to be hard coded as they are subject to a depreciation slope
    // and are therefore hard to calculate.
    // Hard coding helps to simplify this test case
    const EXPECTED_BEFORE = ethers.BigNumber.from("163435396247286514839");
    await expect(bribeBalanceBefore).to.be.equal(EXPECTED_BEFORE);
    const EXPECTED_AFTER = ethers.BigNumber.from("282630566539702584223");
    await expect(bribeBalanceAfter).to.be.equal(EXPECTED_AFTER);
  });
});
