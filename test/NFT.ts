import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("NFT", function () {
  async function deployNFTFixture() {
    const [owner, otherAccount, thirdParty] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();

    return { nft, owner, otherAccount, thirdParty };
  }

  async function mintFixture() {
    const { nft, owner, ...props } = await loadFixture(deployNFTFixture);

    await nft.mint({ value: ethers.parseEther("0.01") });

    return {
      nft,
      owner,
      ...props,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with the right state", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.MAX_SUPPLY()).to.equal(1000);
      expect(await nft.FEE()).to.equal(ethers.parseEther("0.01"));
    });
  });
  describe("mint", function () {
    it("Should throw if not passed the exact amount of ETH", async function () {
      const { nft } = await deployNFTFixture();

      await expect(nft.mint()).to.be.revertedWithCustomError(
        {
          interface: nft.interface,
        },
        "NotExpectedValue"
      );
    });
    it("Should be able to mint a token", async function () {
      const { nft } = await deployNFTFixture();

      await nft.mint({ value: ethers.parseEther("0.01") });

      expect(await nft.totalSupply()).to.equal(1);
    });

    describe("Mint fixture", async () => {
      it("Should mint one NFT", async () => {
        const { nft, owner } = await loadFixture(mintFixture);

        expect(await nft.ownerOf(0)).to.equal(owner);
      });
    });
  });

  describe("ownerOf", () => {
    it("Should throw if NFT is assigned to zero address", async () => {
      const { nft } = await loadFixture(deployNFTFixture);

      await expect(nft.ownerOf(0)).to.be.revertedWithCustomError(
        { interface: nft.interface },
        "InvalidToken"
      );
    });
    it("Should return the correct owner address for a given token id", async function () {
      const { nft, owner } = await loadFixture(deployNFTFixture);

      await nft.mint({
        value: ethers.parseEther("0.01"),
      });

      expect(await nft.ownerOf(0)).to.equal(owner);
    });
  });

  describe("balanceOf", () => {
    it("Should return the right amount of NFT for a given user", async () => {
      const { nft, owner } = await loadFixture(mintFixture);

      expect(await nft.balanceOf(owner)).to.equal(1);

      await nft.mint({ value: ethers.parseEther("0.01") });

      expect(await nft.balanceOf(owner)).to.equal(2);
    });
  });

  describe("getApproved", () => {
    it("Should return the approved address for a given token id", async () => {
      const { nft, otherAccount } = await loadFixture(mintFixture);

      await nft.approve(otherAccount.address, 0);

      expect(await nft.getApproved(0)).to.equal(otherAccount);
    });

    it("Should return the zero address if no approval is set", async () => {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.getApproved(0)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("isApprovedForAll", () => {
    it("Should return true if the operator has been approved", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await nft.setApprovalForAll(otherAccount, true);

      expect(await nft.isApprovedForAll(owner, otherAccount)).to.equal(true);
    });

    it("Should return false if no approval is set", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      expect(await nft.isApprovedForAll(owner, otherAccount)).to.equal(false);
    });
  });

  describe("Approve", () => {
    it("Should throw if `msg.sender`is the current owner of the token or authorized operator", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await expect(
        nft.connect(otherAccount).approve(owner, 0)
      ).to.be.revertedWithCustomError(
        { interface: nft.interface },
        "NotAuthorized"
      );
    });

    it("The current owner should be able to approve an address for a given NFT", async () => {
      const { nft, otherAccount } = await loadFixture(mintFixture);
      await nft.approve(otherAccount, 0);
      expect(await nft.getApproved(0)).to.equal(otherAccount);
    });

    it("An authorized operator should be able to approve an address for a given NFT", async () => {
      const { nft, otherAccount, thirdParty } = await loadFixture(mintFixture);

      await nft.setApprovalForAll(otherAccount, true);

      await nft.connect(otherAccount).approve(thirdParty, 0);

      expect(await nft.getApproved(0)).to.equal(thirdParty);
    });
  });

  describe("setApprovalForAll", () => {
    it("Should enable the approval for a third party to manage all the owner's assets", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await nft.setApprovalForAll(otherAccount, true);

      expect(await nft.isApprovedForAll(owner, otherAccount)).to.equal(true);
    });

    it("Should disable the approval for a third party to manage all the owner's assets", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await nft.setApprovalForAll(otherAccount, true);

      await nft.setApprovalForAll(otherAccount, false);

      expect(await nft.isApprovedForAll(owner, otherAccount)).to.equal(false);
    });

    it("Should emit an ApprovalForAll event", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await expect(nft.setApprovalForAll(otherAccount, true))
        .to.emit(nft, "ApprovalForAll")
        .withArgs(owner, otherAccount, true);
    });
  });

  describe("transferFrom", () => {
    it("Should throw if the sender is not the owner of the token, an approved address, or an authorized operator", async () => {
      const { nft, owner, otherAccount, thirdParty } = await loadFixture(
        mintFixture
      );

      await expect(
        nft
          .connect(thirdParty)
          .transferFrom(owner.address, otherAccount.address, 0)
      ).to.be.revertedWithCustomError(
        { interface: nft.interface },
        "NotAuthorized"
      );
    });

    it("Should throw if the token is not owned by the sender", async () => {
      const { nft, otherAccount, thirdParty } = await loadFixture(mintFixture);

      await nft.approve(otherAccount, 0);

      await expect(
        nft.connect(otherAccount).transferFrom(otherAccount, thirdParty, 0)
      ).to.be.revertedWithCustomError(
        { interface: nft.interface },
        "NotAuthorized"
      );
    });

    it("Should be able to transfer a token", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await nft.transferFrom(owner, otherAccount, 0);

      expect(await nft.ownerOf(0)).to.equal(otherAccount);
    });

    it("Should be able to transfer a token if the sender is an authorized operator", async () => {
      const { nft, owner, otherAccount, thirdParty } = await loadFixture(
        mintFixture
      );

      await nft.setApprovalForAll(otherAccount, true);

      await nft.connect(otherAccount).transferFrom(owner, thirdParty, 0);

      expect(await nft.ownerOf(0)).to.equal(thirdParty);
    });

    it("Should throw if `to` is the zero address", async () => {
      const { nft, owner } = await loadFixture(mintFixture);

      await expect(
        nft.transferFrom(owner, ethers.ZeroAddress, 0)
      ).to.be.revertedWithCustomError(
        { interface: nft.interface },
        "ZeroAddress"
      );
    });

    it("Should emit a Transfer event", async () => {
      const { nft, owner, otherAccount } = await loadFixture(mintFixture);

      await expect(nft.connect(owner).transferFrom(owner, otherAccount, 0))
        .to.emit(nft, "Transfer")
        .withArgs(owner, otherAccount, 0);
    });
  });
});
