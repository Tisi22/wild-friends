const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deploy() {
    const [owner, minter, sanctuary, _] = await ethers.getSigners();

    const factorySanctuary = await ethers.getContractFactory("Sanctuary");
    const sanctuaryContract = await factorySanctuary.deploy(owner.address, sanctuary.address);
    const sanctuaryContractAddress = await sanctuaryContract.address;
    console.log("Sanctuary contract contract deployed at: ", sanctuaryContractAddress);

    const minterAddress = await minter.address;
    const ownerAddress = await owner.address;
    const sanctuaryAddress = await sanctuary.address;

    const factoryWildFriendsMain = await ethers.getContractFactory("WildFriendsMain");
    const wildFriendsMaincontract = await factoryWildFriendsMain.deploy(ownerAddress, sanctuaryContractAddress);
    const wildFriendsMaincontractAddress = await wildFriendsMaincontract.address;
    console.log("WildFriendsMain contract deployed at: ", wildFriendsMaincontractAddress);

    await sanctuaryContract.setWildFriendsMainAddress(wildFriendsMaincontractAddress)

    return {
        owner,
        ownerAddress,
        minter,
        minterAddress,
        sanctuaryAddress,
        sanctuaryContract,
        sanctuaryContractAddress,
        wildFriendsMaincontract,
        wildFriendsMaincontractAddress
    }
}

describe("Deployment & Setup", async function() {

    it("Should set the correct owner in Sanctuary.sol", async function () {
  
      const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
  
      expect(await sanctuaryContract.owner()).to.equal(ownerAddress);
    });

    it("Should set the correct owner in WildFriendsMain.sol", async function () {
  
        const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
    
        expect(await wildFriendsMaincontract.owner()).to.equal(ownerAddress);
    });

    it("Should set the correct Sanctuary contract address in WildFriendsMain.sol", async function () {
  
        const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
    
        expect(await wildFriendsMaincontract.sanctuaryAddr()).to.equal(sanctuaryContractAddress);
    });
  
    it("Should add a WildFriendsMainAddress in Sanctuary.sol", async function () {
  
        const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
  
      expect(await sanctuaryContract.setWildFriendsMainAddress(wildFriendsMaincontractAddress))
        .to.emit(sanctuaryContract, 'WildFriendsMainAddressSet')
        .withArgs(wildFriendsMaincontractAddress)
    });
  
});


describe("WildFriends.sol", async function() {

    it("Should set the correct price", async function () {
  
      const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
        
      const price = ethers.utils.parseUnits("1", "ether");

      expect(await wildFriendsMaincontract.setPrice(1, price))
        .to.emit(wildFriendsMaincontract, 'PriceSet')
        .withArgs(1, price)
    });

    it("Should set the correct active Id", async function () {
  
        const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
  
        expect(await wildFriendsMaincontract.setAciveId(1, true))
          .to.emit(wildFriendsMaincontract, 'ActiveIdSet')
          .withArgs(1, true)
    });

    it("Should set the URI", async function () {
  
        const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
  
        expect(await wildFriendsMaincontract.setURI("aaa"))
          .to.emit(wildFriendsMaincontract, 'URISet')
          .withArgs("aaa")
    });

    it("Should mint", async function () {
  
        const {owner, ownerAddress, minter, minterAddress, sanctuaryAddress, sanctuaryContract, sanctuaryContractAddress, wildFriendsMaincontract, wildFriendsMaincontractAddress} = await deploy()
          
        const price = ethers.utils.parseUnits("1", "ether");

        await wildFriendsMaincontract.setPrice(1, price);
        await wildFriendsMaincontract.setAciveId(1, true);
    
        const mintTx = await wildFriendsMaincontract.connect(minter).mint(minterAddress, 1, { value: price });
    
        await expect(mintTx)
            .to.emit(wildFriendsMaincontract, 'TransferSingle')
            .withArgs(minterAddress, ethers.constants.AddressZero, minterAddress, 1, 1);

    });  
  
});

describe("Sanctuary.sol", async function() {

    it("Should transfer half of the mint price to both the owner and the Sanctuary address", async function () {
        const {
            owner, 
            ownerAddress, 
            minter, 
            minterAddress, 
            sanctuaryAddress, 
            sanctuaryContract, 
            sanctuaryContractAddress, 
            wildFriendsMaincontract, 
            wildFriendsMaincontractAddress
        } = await deploy();
          
        const price = ethers.utils.parseUnits("1", "ether");
    
        await wildFriendsMaincontract.setPrice(1, price);
        await wildFriendsMaincontract.setAciveId(1, true);
    
        // Get balance of the owner and Sanctuary address before the mint
        const balanceBeforeOwner = await ethers.provider.getBalance(ownerAddress);
        const balanceBeforeSanctuary = await ethers.provider.getBalance(sanctuaryAddress);
    
        // Execute the mint transaction
        await wildFriendsMaincontract.connect(minter).mint(minterAddress, 1, { value: price });
    
        // Get balance of the owner and Sanctuary address after the mint
        const balanceAfterOwner = await ethers.provider.getBalance(ownerAddress);
        const balanceAfterSanctuary = await ethers.provider.getBalance(sanctuaryAddress);
    
        // Half of the mint price should be transferred to each
        const expectedIncrease = price.div(2);
    
        // Assert that both the owner's and Sanctuary's balances have increased by the expected amount
        expect(balanceAfterOwner.sub(balanceBeforeOwner)).to.equal(expectedIncrease);
        expect(balanceAfterSanctuary.sub(balanceBeforeSanctuary)).to.equal(expectedIncrease);
    });
    
});