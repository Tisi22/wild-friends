// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { StringUtils } from "./libraries/StringUtils.sol";

contract WildFriendsMain is ERC1155, ERC2981, Ownable, ReentrancyGuard {

    //Mapping for the prices token Id => Price with the 18 decimals
    mapping (uint256 => uint256) public prices;

    string _uri;

    address public sanctuaryAddr;

    mapping(uint256 => bool) activeIds;

    // Event definitions
    event PriceSet(uint256 indexed id, uint256 price);
    event URISet(string newURI);
    event ActiveIdSet(uint256 indexed id, bool isActive);
    event FeeNumeratorSet(address indexed receiver, uint96 feeNumerator);
    event SanctuaryAddrSet(address indexed sanctuary);
    event Withdrawn(address indexed sanctuary, uint256 amount);

    constructor(address initialOwner, address sanctuary) ERC1155("") Ownable(initialOwner) {
        sanctuaryAddr = sanctuary;
    }

    //----- SET FUNCTIONS -----//

    function setPrice(uint256 id, uint256 _price) public onlyOwner {
        prices[id] = _price;
        emit PriceSet(id, _price);
    }

    function setURI(string memory newuri) public onlyOwner {
        _uri = newuri;
        emit URISet(newuri);
    }

    /**
    * @dev Activate/diactivate an id
    */
    function setAciveId(uint256 id, bool val) external onlyOwner {
        activeIds[id] = val;
        emit ActiveIdSet(id, val);
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
        emit FeeNumeratorSet(receiver, feeNumerator);
    }

    /// @notice Set the address of the Sanctuary
    /// @dev Call only by Owner.
    /// @param sanctuary The new address
    function SetSanctuaryAddr(address sanctuary) public onlyOwner {
        sanctuaryAddr = sanctuary;
        emit SanctuaryAddrSet(sanctuary);
    }

    //----- END -----//

    //----- MINT -----//


    /// @notice Mints an NFT
    /// @param account account to send the NFT
    /// @param id NFT´s id to send
    function mint(address account, uint256 id) public payable nonReentrant {
        require(msg.value >= prices[id], "Not enough value sent");
        require(activeIds[id], "Token Id minting is not active");

        // Using call to send calue
        (bool sent, ) = payable(sanctuaryAddr).call{value: msg.value}("");
        require(sent, "Failed to send value");

        _mint(account, id, 1, "");
    }
  

    /// @notice MInt NFTs for the Airdrop.
    /// @dev It can be only calledby the owner
    /// @param to Array of addresses to send the NFTs
    /// @param ids Ids to be sent
    /// @param amounts Amount to be sent
    function mintAirdrop(address[] memory to, uint256[] memory ids, uint256[] memory amounts)
        public
        onlyOwner
    {
        require(to.length == ids.length && ids.length == amounts.length, "Array lengths must match");

        for (uint i = 0; i < to.length; i++)
        {
            _mint(to[i], ids[i], amounts[i], "");
        }

    }

    //-----END-----//

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

    /**
     * @dev Allows the owner to withdraw Ether from the contract to the Sanctuary
     */
    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No Ether left to withdraw");

        // Using call to send calue
        (bool sent, ) = payable(sanctuaryAddr).call{value: balance}("");
        require(sent, "Failed to send value");

        emit Withdrawn(sanctuaryAddr, balance);
    }

}