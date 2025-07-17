// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

// Minimal ERC-6551 implementation for a Token Bound Account
contract TokenBoundAccount is IERC721Receiver, IERC1155Receiver, IERC1271 {
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

    // Event emitted when a call is executed
    event TransactionExecuted(
        address indexed to,
        uint256 value,
        bytes data,
        bytes result
    );

    constructor(
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) payable {
        ERC6551_REGISTRY = msg.sender; // The registry is the deployer
        SALT = salt;
        CHAIN_ID = chainId;
        TOKEN_CONTRACT = tokenContract;
        TOKEN_ID = tokenId;
    }

    // Fallback function to receive Ether
    receive() external payable {}

    // Allows the token owner to execute arbitrary calls
    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external returns (bytes memory result) {
        // Only the token owner can execute calls
        require(msg.sender == owner(), "Not token owner");

        // Operation types: 0 for call, 1 for delegatecall, 2 for create, 3 for create2
        // For simplicity, we'll only support direct calls (operation 0)
        require(operation == 0, "Unsupported operation");

        (bool success, bytes memory returnData) = to.call{value: value}(data);
        require(success, string(returnData));

        emit TransactionExecuted(to, value, data, returnData);
        return returnData;
    }

    // Returns the owner of the token that controls this account
    function owner() public view returns (address) {
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

    // ERC-721 Receiver interface
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // ERC-1155 Receiver interface
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
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
