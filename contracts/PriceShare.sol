// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PriceShare is Ownable, ReentrancyGuard{

    address public sanctuary;

    constructor(address initialOwner, address _sanctuary) Ownable(initialOwner) {
       sanctuary = _sanctuary;
    }

    function setSanctuary(address _sanctuary) public onlyOwner {
        sanctuary = _sanctuary;
    }

    function share() private nonReentrant {
        uint balance = address(this).balance;
        require(balance > 0, "No Ether left to withdraw");

        address _owner = owner();

        (bool sentS, ) = payable(sanctuary).call{value: balance/2}("");
        require(sentS, "Failed to send value to sanctuary");

        (bool sentO, ) = payable(_owner).call{value: balance/2}("");
        require(sentO, "Failed to send value to owner");

    }

    /**
     * @dev Allows the owner to withdraw Ether from the contract.
    */
    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No Ether left to withdraw");

        (bool sent, ) = msg.sender.call{value: balance}("");
        require(sent, "Failed to send Ether");
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