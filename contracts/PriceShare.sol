// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceShare is Ownable{

    address public sanctuary;

    constructor(address initialOwner, address _sanctuary) Ownable(initialOwner) {
       sanctuary = _sanctuary;
    }

    function setSanctuary(address _sanctuary) public onlyOwner {
        sanctuary = _sanctuary;
    }

    function share() private {
        uint balance = address(this).balance;
        require(balance > 0, "No Ether left to withdraw");

        uint ownerBalance = balance/20;
        uint sanctuaryBlance = balance - ownerBalance;
        address _owner = owner();

        (bool sentSanctuary, ) = sanctuary.call{value: sanctuaryBlance}("");
        require(sentSanctuary, "Failed to send Ether to sanctuary");

        (bool sentOwner, ) = _owner.call{value: ownerBalance}("");
        require(sentOwner, "Failed to send Ether to owner");
    }

    // Function to receive Matic. msg.data must be empty
    receive() external payable {
        share();
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        share();
    }
}