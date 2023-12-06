//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {BaseWildFriendsCollectibles} from "./BaseWildFriendsCollectibles.sol";



contract WildFriendsCollectibles is EIP712, AccessControl, Ownable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string private constant SIGNING_DOMAIN = "WildFriendsCollectibles-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    //Base ERC1155 smart contract
    BaseWildFriendsCollectibles public immutable base;

    //Mapping with the prices of the NFTs (With 10^18)
    mapping (uint256 => uint256) price;

    address public sanctuaryAddr;

    struct NFTVoucher {
        uint256 tokenId;
        bytes signature;
    }


    constructor(address minter, BaseWildFriendsCollectibles _base, address initialOwner, address sanctuary) 
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) Ownable(initialOwner){
        base = _base;
        sanctuaryAddr = sanctuary;
        _grantRole(MINTER_ROLE, minter);
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /// @notice Redeems an NFTVoucher for an actual NFT, creating it in the process.
    /// @param redeemer The address of the account which will receive the NFT upon success.
    /// @param voucher A signed NFTVoucher with the tokenId tp mint.
    function redeemNFTCollectible(address redeemer, NFTVoucher calldata voucher) public payable nonReentrant {
        require(msg.value >= price[voucher.tokenId], "Not enough value sent" );
        // make sure signature is valid and get the address of the signer
        address signer = _verify(voucher);

        // make sure that the signer is authorized to mint NFTs
        require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized");

        // Using call to send calue
        (bool sent, ) = payable(sanctuaryAddr).call{value: msg.value}("");
        require(sent, "Failed to send value");

        base.mint(redeemer, voucher.tokenId);

    }


    function _hash(NFTVoucher calldata voucher) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("NFTVoucher(uint256 tokenId)"),
            voucher.tokenId
        )));
    }

    /// @notice Returns the chain id of the current blockchain.
    /// @dev This is used to workaround an issue with ganache returning different values from the on-chain chainid() function and
    ///  the eth_chainId RPC method. See https://github.com/protocol/nft-website/issues/121 for context.
    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /// @notice Verifies the signature for a given NFTVoucher, returning the address of the signer.
    /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
    /// @param voucher An NFTVoucher describing an unminted NFT.
    function _verify(NFTVoucher calldata voucher) public view returns (address) {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    /// @notice Set the prices for the NFTs
    /// @dev Call only by Owner.
    /// @param id Token Id.
    /// @param _price price with decimals (10^18)
    function setPrice(uint256 id, uint256 _price) public onlyOwner {
        price[id] = _price;
    }

    /// @notice Set the address of the Sanctuary
    /// @dev Call only by Owner.
    /// @param sanctuary The new address
    function SetSanctuaryAddr(address sanctuary) public onlyOwner {
        sanctuaryAddr = sanctuary;
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No Ether left to withdraw");

        // Using call to send calue
        (bool sent, ) = payable(sanctuaryAddr).call{value: balance}("");
        require(sent, "Failed to send value");
    }

    // Function to receive Matic. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}


}
