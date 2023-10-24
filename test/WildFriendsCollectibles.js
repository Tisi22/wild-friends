const { expect } = require("chai");
const { ethers } = require("hardhat");
const { LazyMinter } = require('../lib')


async function deploy() {
    const [owner, minter, redeemer, _] = await ethers.getSigners();

    const Base = await ethers.getContractFactory("BaseWildFriendsCollectibles");
    const base = await Base.deploy(owner.address);
    const basenftAddress = await base.address;
    console.log("Base contract deployed at: ", basenftAddress);

    const minterAddress = await minter.address;
    const ownerAddress = await owner.address;

    const Collectibles = await ethers.getContractFactory("WildFriendsCollectibles");
    const contract = await Collectibles.deploy(minterAddress, basenftAddress, ownerAddress);
    const collectiblesAddress = await contract.address;
    console.log("Collectibles contract deployed at: ", collectiblesAddress);

    return {
        owner,
        ownerAddress,
        minter,
        minterAddress,
        redeemer,
        base,
        basenftAddress,
        contract,
        collectiblesAddress
    }
}

describe("Deployment & Setup", async function() {

  it("Should set the correct minter", async function () {

    const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()

    expect(await contract.hasRole(await contract.MINTER_ROLE(), minterAddress)).to.be.true;
  });

  it("Should set the correct base contract address", async function () {

    const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()

    expect(await contract.base()).to.equal(basenftAddress);
  });

  it("Should add a controller in base contract", async function () {

    const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()

    expect(await base.addController(collectiblesAddress))
      .to.emit(base, 'ControllerAdded')
      .withArgs(collectiblesAddress)
  });

});

describe("Minting using voucher", function () {
    it("Should mint an NFT using a valid voucher", async function () {
      const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()
      const tokenId = 1;
      await base.setMintState(true);
      await base.setAciveId(tokenId, true);

      const lazyMinter = new LazyMinter({contract, signer: minter })
      const voucher = await lazyMinter.createVoucher(1)

      console.log(voucher);

      const redeemerAddress = await redeemer.address;

      await base.addController(collectiblesAddress);
      
      /*const digest = await collectibles._hash({tokenId});  // Assuming you make this function public for testing purposes
      const signature = await minter.signMessage(ethers.utils.arrayify(digest));
      const voucher = {
        tokenId,
        signature
      };*/

      await contract.redeemNFTCollectible(redeemerAddress, voucher);
      expect(await base.balanceOf(redeemerAddress, tokenId)).to.equal(1);
    });

    it("Should fail to mint using an invalid voucher", async function () {

      const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()

      const tokenId = 1;
      await base.setMintState(true);
      await base.setAciveId(tokenId, true);

      const lazyMinter = new LazyMinter({contract, signer: redeemer })
      const voucher = await lazyMinter.createVoucher(1)

      console.log(voucher);

      const redeemerAddress = await redeemer.address;

      await base.addController(collectiblesAddress);

      await expect(contract.redeemNFTCollectible(redeemerAddress, voucher)).to.be.revertedWith("Signature invalid or unauthorized");
    });
});



