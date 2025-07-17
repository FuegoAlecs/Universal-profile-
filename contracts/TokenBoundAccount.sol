// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title TokenBoundAccount
 * @dev ERC-6551 Token Bound Account implementation for Universal Profiles
 */
contract TokenBoundAccount is ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event Executed(address indexed target, uint256 value, bytes data, bytes result);
    event TokenReceived(address indexed token, uint256 amount);
    event NFTReceived(address indexed collection, uint256 tokenId);

    // Storage
    uint256 private _state;
    
    // ERC-6551 required functions
    function token() public view returns (uint256 chainId, address tokenContract, uint256 tokenId) {
        bytes memory footer = new bytes(0x60);
        
        assembly {
            extcodecopy(address(), add(footer, 0x20), 0x4d, 0x60)
        }
        
        return abi.decode(footer, (uint256, address, uint256));
    }

    function state() external view returns (uint256) {
        return _state;
    }

    function isValidSigner(address signer, bytes calldata) external view returns (bytes4) {
        if (_isValidSigner(signer)) {
            return IERC1271.isValidSignature.selector;
        }
        return 0xffffffff;
    }

    /**
     * @dev Execute a transaction from the token bound account
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external payable nonReentrant returns (bytes memory result) {
        require(_isValidSigner(msg.sender), "Invalid signer");
        require(target != address(0), "Invalid target");

        _state++;

        bool success;
        (success, result) = target.call{value: value}(data);
        
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }

        emit Executed(target, value, data, result);
    }

    /**
     * @dev Batch execute multiple transactions
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata data
    ) external payable nonReentrant returns (bytes[] memory results) {
        require(_isValidSigner(msg.sender), "Invalid signer");
        require(targets.length == values.length && targets.length == data.length, "Array length mismatch");

        results = new bytes[](targets.length);
        _state++;

        for (uint256 i = 0; i < targets.length; i++) {
            require(targets[i] != address(0), "Invalid target");
            
            bool success;
            (success, results[i]) = targets[i].call{value: values[i]}(data[i]);
            
            if (!success) {
                assembly {
                    revert(add(results, add(32, mul(i, 32))), mload(add(results, mul(i, 32))))
                }
            }

            emit Executed(targets[i], values[i], data[i], results[i]);
        }
    }

    /**
     * @dev Check if an address is a valid signer for this account
     */
    function _isValidSigner(address signer) internal view returns (bool) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        
        if (chainId != block.chainid) {
            return false;
        }

        try IERC721(tokenContract).ownerOf(tokenId) returns (address owner) {
            return signer == owner;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get the owner of the bound token
     */
    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        
        if (chainId != block.chainid) {
            return address(0);
        }

        try IERC721(tokenContract).ownerOf(tokenId) returns (address tokenOwner) {
            return tokenOwner;
        } catch {
            return address(0);
        }
    }

    // Receive functions
    receive() external payable {
        emit TokenReceived(address(0), msg.value);
    }

    function onERC721Received(
        address,
        address,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        emit NFTReceived(msg.sender, tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    // ERC-165 support
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC165).interfaceId ||
               interfaceId == type(IERC721Receiver).interfaceId ||
               interfaceId == type(IERC1155Receiver).interfaceId;
    }
}

// Required interfaces
interface IERC1271 {
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4);
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

interface IERC1155Receiver {
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) external returns (bytes4);
    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external returns (bytes4);
}
