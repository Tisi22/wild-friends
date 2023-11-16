// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract WildFriendsMain is ERC1155, Ownable {

    //Mapping for the prices token Id => Price with the 18 decimals
    mapping (uint256 => uint256) prices;

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function SetPrice(uint256 id, uint256 _price) public onlyOwner {
        prices[id] = _price;
    }

    function mint(address account, uint256 id, uint256 amount) payable public {

        (bool val, uint256 num) = Math.tryMul(prices[id], amount);

        require(val, "Amount not valid");
        require(msg.value >= num , "Not enough matic sent");

        _mint(account, id, amount, "");
    }


    //Podemos hacer manualmente enviar los 30 del airdrop en luar de que ellos tengan que pagar los fees.
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, "");
    }
}