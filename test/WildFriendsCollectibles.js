const { expect } = require("chai");
const { ethers } = require("hardhat");


//Error in grantRole--> Check the smart contract because it has changed from openZeppelin
async function deploy() {
    const [owner, minter, redeemer, _] = await ethers.getSigners();

    const Base = await ethers.getContractFactory("BaseWildFriendsCollectibles");
    base = await Base.deploy(owner.address);
    const basenftAddress = await base.getAddress();
    console.log("Base contract deployed at: ", basenftAddress);

    const minterAddress = await minter.getAddress();
    const ownerAddress = await owner.getAddress();

    const Collectibles = await ethers.getContractFactory("WildFriendsCollectibles");
    collectibles = await Collectibles.deploy(minterAddress, basenftAddress, ownerAddress);
    const collectiblesAddress = await collectibles.getAddress();
    console.log("Collectibles contract deployed at: ", collectiblesAddress);

    return {
        owner,
        minter,
        redeemer,
        base,
        collectibles,
    }
}

describe("Deployment & Setup", async function() {
    
    it("Should deploy", async function () {
        await deploy()
    });

});

  /*describe("Minting using voucher", function () {
    it("Should mint an NFT using a valid voucher", async function () {
      const tokenId = 1;
      await base.setMintState(true);
      await base.setAciveId(tokenId, true);
      
      const digest = await collectibles._hash({tokenId});  // Assuming you make this function public for testing purposes
      const signature = await minter.signMessage(ethers.utils.arrayify(digest));
      const voucher = {
        tokenId,
        signature
      };

      await collectibles.redeemNFTCollectible(redeemer.address, voucher);
      expect(await base.balanceOf(redeemer.address, tokenId)).to.equal(1);
    });

    it("Should fail to mint using an invalid voucher", async function () {
      const tokenId = 1;
      const signature = await redeemer.signMessage(ethers.utils.arrayify(tokenId)); // intentionally wrong
      const voucher = {
        tokenId,
        signature
      };

      await expect(collectibles.redeemNFTCollectible(redeemer.address, voucher)).to.be.revertedWith("Signature invalid or unauthorized");
    });
  });

  describe("Simple ERC1155 Minting Operations", function () {
    it("Should mint an ERC1155 token", async function () {
      const tokenId = 1;

      await base.addController(collectibles.address);
      await base.setAciveId(tokenId, true);
      await base.setMintState(true);

      const digest = await collectibles._hash({tokenId});  // Assuming you make this function public for testing purposes
      const signature = await minter.signMessage(ethers.utils.arrayify(digest));

      await collectibles.redeemNFTCollectible(redeemer.address, {
        tokenId,
        signature
      });

      expect(await base.balanceOf(redeemer.address, tokenId)).to.equal(1);
    });
  });*/

