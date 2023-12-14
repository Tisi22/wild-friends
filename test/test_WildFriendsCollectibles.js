const { expect } = require("chai");
const { ethers } = require("hardhat");
const { LazyMinter } = require('../lib')


async function deploy() {
    const [owner, minter, redeemer, sanctuary, _] = await ethers.getSigners();

    const Base = await ethers.getContractFactory("BaseWildFriendsCollectibles");
    const base = await Base.deploy(owner.address);
    const basenftAddress = await base.address;
    console.log("Base contract deployed at: ", basenftAddress);

    const factorySanctuary = await ethers.getContractFactory("Sanctuary");
    const sanctuaryContract = await factorySanctuary.deploy(owner.address, sanctuary.address);
    const sanctuaryContractAddress = await sanctuaryContract.address;
    console.log("Sanctuary contract contract deployed at: ", sanctuaryContractAddress);

    const minterAddress = await minter.address;
    const ownerAddress = await owner.address;
    const sanctuaryAddress = await sanctuary.address;

    const Collectibles = await ethers.getContractFactory("WildFriendsCollectibles");
    const contract = await Collectibles.deploy(minterAddress, basenftAddress, ownerAddress, sanctuaryContractAddress);
    const collectiblesAddress = await contract.address;
    console.log("Collectibles contract deployed at: ", collectiblesAddress);

    await sanctuaryContract.setWildFriendsMainAddress(collectiblesAddress);

    return {
        owner,
        ownerAddress,
        minter,
        minterAddress,
        redeemer,
        sanctuaryAddress,
        base,
        basenftAddress,
        contract,
        collectiblesAddress,
        sanctuaryContractAddress,
        sanctuaryContract
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
    it("Should mint an NFT using a valid voucher1", async function () {
      const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()
      const tokenId = 1;
      await base.setMintState(true);
      await base.setAciveId(tokenId, true);

      const lazyMinter = new LazyMinter({contract, signer: minter })
      const voucher = await lazyMinter.createVoucher(1)

      console.log(voucher);

      const redeemerAddress = await redeemer.address;

      await base.addController(collectiblesAddress);

      await contract.redeemNFTCollectible(redeemerAddress, voucher);
      expect(await base.balanceOf(redeemerAddress, tokenId)).to.equal(1);
    });

    it("Should mint an NFT using a valid voucher2", async function () {
      const {owner, ownerAddress, minter, minterAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()
      const tokenId = 1;
      await base.setMintState(true);
      await base.setAciveId(tokenId, true);

      const lazyMinter = new LazyMinter({contract, signer: minter })
      const voucher = await lazyMinter.createVoucher(1)

      console.log(voucher);

      const redeemerAddress = await redeemer.address;

      await base.addController(collectiblesAddress);
      
      await base.setURI("aaaaaaaaaaaa");

      await contract.redeemNFTCollectible(redeemerAddress, voucher, { value: ethers.utils.parseUnits("0", "ether") });

      const tokenUri = await base.uri(1);

      console.log(tokenUri);
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

      await expect(contract.redeemNFTCollectible(redeemerAddress, voucher, { value: ethers.utils.parseUnits("0", "ether") })).to.be.revertedWith("Signature invalid or unauthorized");
    });
});

describe("Minting using voucher with payment", function () {
  it("Should mint an NFT using a valid voucher and value tranfer", async function () {
    const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, redeemer, base, basenftAddress, contract, collectiblesAddress} = await deploy()
    const tokenId = 1;
    await base.setMintState(true);
    await base.setAciveId(tokenId, true);

    const lazyMinter = new LazyMinter({contract, signer: minter })
    const voucher = await lazyMinter.createVoucher(1)

    console.log(voucher);

    const redeemerAddress = await redeemer.address;

    await base.addController(collectiblesAddress);
    
    await contract.setPrice(1, ethers.utils.parseUnits("0.01", "ether"));

    await contract.redeemNFTCollectible(redeemerAddress, voucher, { value: ethers.utils.parseUnits("0.01", "ether") });
    expect(await base.balanceOf(redeemerAddress, tokenId)).to.equal(1);
  });

 
});



