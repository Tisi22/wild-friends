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

        address _owner = owner();

        bool sentS = payable(sanctuary).send(balance/2);
        require(sentS, "Failed to send Ether to sanctuary");

        bool sentOwner = payable(_owner).send(balance/2);
        require(sentOwner, "Failed to send Ether to owner");
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