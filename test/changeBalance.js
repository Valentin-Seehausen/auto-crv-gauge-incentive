const { ethers, network } = require("hardhat");

const changeBalance = async (token, account, balance, storageIndex = 2) => {
  const index = ethers.utils.solidityKeccak256(
    ["uint256", "uint256"],
    [account, storageIndex] // key, slot
  );
  await setStorageAt(token, index.toString(), toBytes32(balance).toString());
};

const toBytes32 = (bn) => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};

const setStorageAt = async (address, index, value) => {
  await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
  await ethers.provider.send("evm_mine", []); // Just mines to the next block
};

exports.changeBalance = changeBalance;
