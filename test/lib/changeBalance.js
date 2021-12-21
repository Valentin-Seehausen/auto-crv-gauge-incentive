const { ethers, network } = require("hardhat");

/**
 * Changes Tokenbalance of account on local hardhat evm fork.
 * @param {*} token  Address of token
 * @param {*} account  Address of account / wallet
 * @param {*} balance  Balance to set, include decimals.
 * @param {*} storageIndex  Usually 2.
 */
async function changeBalance(token, account, balance, storageIndex = 2) {
  const index = ethers.utils.solidityKeccak256(
    ["uint256", "uint256"],
    [account, storageIndex] // key, slot
  );
  await setStorageAt(token, index.toString(), toBytes32(balance).toString());
}

function toBytes32(bn) {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
}

async function setStorageAt(address, index, value) {
  await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
  await ethers.provider.send("evm_mine", []); // Just mines to the next block
}

exports.changeBalance = changeBalance;
