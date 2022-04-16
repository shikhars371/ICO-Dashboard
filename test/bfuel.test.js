const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BitFuelToken", () => {
  it("Should return the token name", async () => {
    const BitFuelToken = await ethers.getContractFactory("BitFuelToken");
    const bitFuelToken = await BitFuelToken.deploy();
    await bitFuelToken.deployed();

    expect(await bitFuelToken.name()).to.equal("BitFuel");
  });

  it("Should return the token symbol", async () => {
    const BitFuelToken = await ethers.getContractFactory("BitFuelToken");
    const bitFuelToken = await BitFuelToken.deploy();
    await bitFuelToken.deployed();

    expect(await bitFuelToken.symbol()).to.equal("BFUEL");
  });

  it("Should return decimals", async () => {
    const BitFuelToken = await ethers.getContractFactory("BitFuelToken");
    const bitFuelToken = await BitFuelToken.deploy();
    await bitFuelToken.deployed();

    expect(await bitFuelToken.decimals()).to.equal(18);
  });

  it("Should have total supply", async () => {
    const BitFuelToken = await ethers.getContractFactory("BitFuelToken");
    const bitFuelToken = await BitFuelToken.deploy();
    await bitFuelToken.deployed();

    expect(await bitFuelToken.totalSupply()).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  });
});
