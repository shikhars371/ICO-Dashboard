const { expect } = require("chai");
const { ethers } = require("hardhat");

async function latestTime() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

const duration = {
  seconds(val) {
    return val;
  },
  minutes(val) {
    return val * this.seconds(60);
  },
  hours(val) {
    return val * this.minutes(60);
  },
  days(val) {
    return val * this.hours(24);
  },
  weeks(val) {
    return val * this.days(7);
  },
  years(val) {
    return val * this.days(365);
  },
};

describe("BitFuelTokenCrowdsale", () => {
  it("Should have 70% of BitFuelToken tokens", async () => {
    const BitFuelToken = await ethers.getContractFactory("BitFuelToken");
    const bitFuelToken = await BitFuelToken.deploy();
    await bitFuelToken.deployed();

    expect(await bitFuelToken.name()).to.equal("BitFuel");
    expect(await bitFuelToken.symbol()).to.equal("BFUEL");
    expect(await bitFuelToken.decimals()).to.equal(18);
    const totalSupply = await bitFuelToken.totalSupply();
    expect(totalSupply).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    const owner = await bitFuelToken.owner();

    const latestBlockTime = await latestTime();
    const openingTime = latestBlockTime + duration.minutes(1);
    const closeTime = openingTime + duration.weeks(1); // 1 week

    const BitFuelTokenCrowdsale = await ethers.getContractFactory("BitFuelTokenCrowdsale");
    const rate = 500; // 500 wei per token
    const bitFuelTokenCrowdsale = await BitFuelTokenCrowdsale.deploy(
      rate,
      owner,
      bitFuelToken.address,
      owner,
      openingTime,
      closeTime
    );

    await bitFuelTokenCrowdsale.deployed();

    await bitFuelToken.approve(
      bitFuelTokenCrowdsale.address,
      totalSupply.mul(ethers.BigNumber.from(70)).div(ethers.BigNumber.from(100))
    );

    expect(await bitFuelTokenCrowdsale.rate()).to.equal(rate);
    expect(await bitFuelTokenCrowdsale.remainingTokens()).to.equal(ethers.BigNumber.from("700000000000000000000000"));
  });
  // TODO: add unit test for time validation
  // TODO: add unit test for token allocation
});
