// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Sanctuary is Ownable, ReentrancyGuard{

    address public sanctuary;

    address wildFriendsMainAddress;

    modifier onlyWildFriendsMain() {
    require(msg.sender == wildFriendsMainAddress, "Caller is not WildFriendsMain");
    _;
    }

    event WildFriendsMainAddressSet(address indexed wildFriendsMain);

    constructor(address initialOwner, address _sanctuary) Ownable(initialOwner) {
       sanctuary = _sanctuary;
    }

    function setSanctuary(address _sanctuary) public onlyOwner {
        sanctuary = _sanctuary;
    }

    function setWildFriendsMainAddress(address _wildFriendsMainAddress) public onlyOwner {
        wildFriendsMainAddress = _wildFriendsMainAddress;
        emit WildFriendsMainAddressSet(_wildFriendsMainAddress);
    }

    function transfer() public payable onlyWildFriendsMain nonReentrant returns (bool) {
        address _owner = owner();
        uint value = msg.value / 2;

        // First transfer to sanctuary
        (bool sentS, ) = payable(sanctuary).call{value: value}("");
        if (!sentS) {
            return false;
        }

        // Second transfer to owner
        (bool sentO, ) = payable(_owner).call{value: msg.value - value}("");
        if (!sentO) {
            return false;
        }

        return true;
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
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
    }
}