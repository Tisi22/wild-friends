// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import { StringUtils } from "./libraries/StringUtils.sol";

contract BaseWildFriendsCollectibles is ERC1155, ERC2981, Ownable {
    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    bool public mintState;

    string _uri;

    mapping(address => bool) public controllers;

    mapping(uint256 => bool) activeIds;

    event ActiveIdUpdate(uint256 indexed id, bool val);
    event ControllerAdded(address indexed controller);
    event ControllerRemoved(address indexed controller);


    /**
     * @dev Mints a NFT
    */
    function mint(address account, uint256 id)
        public
    {
        require(controllers[msg.sender], "Not authorized");
        require(mintState, "Minting is paused");
        require(activeIds[id], "Token Id minting is not active");

        _mint(account, id, 1, "");
    }

    //----- SET FUNCTIONS -----//

    //TODO: Do I need to override function uri?
    function setURI(string memory newuri) public onlyOwner {
        _uri = newuri;
    }

    /**
     * @dev Sets the royalty information that all ids in this contract will default to.
     *
     * Requirements:
     *
     * - `receiver` cannot be the zero address.
     * - `feeNumerator` cannot be greater than the fee denominator, if it is 1000 -> 10%.
     */
    function setFeeNum(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev Sets mint state
     */
    function setMintState(bool _mintState) public onlyOwner {
        mintState = _mintState;
    }

    /**
    * @dev Authorises a controller.
    */
    function addController(address controller) external onlyOwner {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    /**
    * @dev Revoke controller permission for an address
    */
    function removeController(address controller) external onlyOwner {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    /**
    * @dev Activate/diactivate an id
    */
    function setAciveId(uint256 id, bool val) external onlyOwner {
        activeIds[id] = val;
        emit ActiveIdUpdate(id,val);
    }

    //----- END -----//

        //----- OVERRIDE FUNCTIONS -----//

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        string memory token = StringUtils.toString(tokenId);
        return bytes(_uri).length > 0 ? string(abi.encodePacked(_uri, token, ".json")) : "";
    }

    //----- END -----//
}


