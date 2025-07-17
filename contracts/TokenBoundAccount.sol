// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

// Minimal ERC-6551 implementation for a Token Bound Account
contract TokenBoundAccount is ERC721Holder, Ownable, IERC1271 {
    using Address for address payable;

    // The ERC-6551 Registry address that deployed this account
    address public immutable ERC6551_REGISTRY;
    // The hash of the salt used to deploy this account
    bytes32 public immutable SALT;
    // The chain ID of the chain this account was deployed on
    uint256 public immutable CHAIN_ID;
    // The address of the ERC-721 token that owns this account
    address public immutable TOKEN_CONTRACT;
    // The ID of the ERC-721 token that owns this account
    uint256 public immutable TOKEN_ID;

    address public ownerTokenContract;
    uint256 public ownerTokenId;

    // Event emitted when a call is executed
    event TransactionExecuted(
        address indexed to,
        uint256 value,
        bytes data,
        bytes result
    );

    event AccountCreated(address indexed owner, address indexed tokenContract, uint256 tokenId);
    event TokenTransferred(address indexed from, address indexed to, uint256 tokenId);

    constructor(
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        address _ownerTokenContract,
        uint256 _ownerTokenId,
        address initialOwner
    ) payable Ownable(initialOwner) {
        ERC6551_REGISTRY = msg.sender; // The registry is the deployer
        SALT = salt;
        CHAIN_ID = chainId;
        TOKEN_CONTRACT = tokenContract;
        TOKEN_ID = tokenId;
        require(_ownerTokenContract != address(0), "Invalid token contract address");
        ownerTokenContract = _ownerTokenContract;
        ownerTokenId = _ownerTokenId;
        emit AccountCreated(initialOwner, _ownerTokenContract, _ownerTokenId);
    }

    // Fallback function to receive Ether
    receive() external payable {}

    // Allows the token owner to execute arbitrary calls
    function execute(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bool success) {
        (success,) = to.call{value: value}(data);
        require(success, "Execution failed");
    }

    // Optional: Function to transfer the ownership token to a new address
    function transferOwnerToken(address _to) external onlyOwner {
        IERC721(ownerTokenContract).transferFrom(address(this), _to, ownerTokenId);
        emit TokenTransferred(address(this), _to, ownerTokenId);
    }

    // Optional: Function to withdraw Ether from the account
    function withdrawEther(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance");
        _to.transfer(_amount);
    }

    // Returns the owner of the token that controls this account
    function owner() public view override returns (address) {
        // If this account is on the same chain as the token,
        // the owner is the current owner of the token.
        if (block.chainid == CHAIN_ID) {
            try IERC721(TOKEN_CONTRACT).ownerOf(TOKEN_ID) returns (address tokenOwner) {
                return tokenOwner;
            } catch {
                revert("Invalid token contract or token ID");
            }
        } else {
            // If this account is on a different chain,
            // the owner is the account itself (or a more complex cross-chain logic).
            // For this example, we'll assume same-chain ownership.
            return address(this);
        }
    }

    // ERC-1271 isValidSignature for contract-based accounts
    function isValidSignature(
        bytes32 _hash,
        bytes calldata _signature
    ) external view override returns (bytes4) {
        // This is a simplified isValidSignature.
        // In a full implementation, this would verify if the signature
        // is valid for the current owner of the token.
        // For now, we'll return 0x1626ba7e if the owner is a valid EOA and signed.
        // Or, if the owner is a contract, it would delegate to the owner's isValidSignature.

        address currentOwner = owner();
        if (currentOwner == address(0)) {
            return 0; // No owner
        }

        // If the owner is an EOA, check if the signature is valid for that EOA
        if (currentOwner.code.length == 0) {
            if (ECDSA.recover(_hash, _signature) == currentOwner) {
                return IERC1271.isValidSignature.selector;
            }
        } else {
            // If the owner is a contract, delegate to its isValidSignature
            // This part would require a more complex setup to handle arbitrary contract owners
            // For simplicity, we'll just return 0 for now if it's a contract owner
            return 0;
        }
        return 0;
    }
}
