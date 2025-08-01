// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProfileRegistry
 * @dev ERC-6551 compatible profile registry with cross-chain wallet linking
 */
contract ProfileRegistry is ERC721, Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;

    Counters.Counter private _profileIds;

    // Packed struct to minimize storage slots
    struct PackedProfile {
        address owner;           // 20 bytes
        uint96 createdAt;       // 12 bytes (fits in same slot)
        string metadataURI;     // separate slot
        bool zkVerified;        // 1 byte
        uint8 walletCount;      // 1 byte (max 255 linked wallets)
        uint8 socialCount;      // 1 byte (max 255 social links)
    }

    struct Profile {
        uint256 id;
        address owner;
        string name;
        string bio;
        string profileImageUri;
        string socialLinks; // JSON string of social links
        uint256 createdAt;
    }

    // Events
    event ProfileCreated(uint256 indexed profileId, address indexed owner, string metadataURI);
    event WalletLinked(uint256 indexed profileId, address indexed wallet, uint256 chainId);
    event WalletUnlinked(uint256 indexed profileId, address indexed wallet);
    event SocialLinked(uint256 indexed profileId, string platform, string handle);
    event ZKVerificationUpdated(uint256 indexed profileId, bool verified);
    event ProfileUpdated(uint256 indexed id, string name, string bio, string profileImageUri, string socialLinks);
    event ProfileRegistered(address indexed owner, string name, string bio, string profileImageUri);
    event ProfileUpdated(address indexed owner, string name, string bio, string profileImageUri);

    // Storage
    mapping(uint256 => PackedProfile) public profiles;
    mapping(uint256 => mapping(uint8 => address)) public linkedWallets;
    mapping(uint256 => mapping(uint256 => bool)) public chainWallets; // profileId => chainId => hasWallet
    mapping(uint256 => mapping(string => string)) public socialLinks; // profileId => platform => handle
    mapping(address => uint256) public addressToProfile; // wallet => profileId
    mapping(address => uint256) private _addressToProfileId;
    mapping(uint256 => Profile) private _profiles;

    // Constants
    uint256 private _currentProfileId;
    uint256 public constant MAX_WALLETS_PER_PROFILE = 10;
    uint256 public constant PROFILE_CREATION_FEE = 0.001 ether;

    // EIP-712 type hash for wallet linking
    bytes32 private constant LINK_WALLET_TYPEHASH = 
        keccak256("LinkWallet(uint256 profileId,address wallet,uint256 chainId,uint256 nonce,uint256 deadline)");

    mapping(address => uint256) public nonces;

    constructor(address initialOwner) 
        ERC721("Universal Profile", "UPROF") 
        Ownable(initialOwner) 
        EIP712("ProfileRegistry", "1")
    {}

    /**
     * @dev Create a new profile
     */
    function createProfile(
        string calldata metadataURI,
        address[] calldata initialWallets,
        uint256[] calldata chainIds
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= PROFILE_CREATION_FEE, "Insufficient fee");
        require(initialWallets.length == chainIds.length, "Array length mismatch");
        require(initialWallets.length <= MAX_WALLETS_PER_PROFILE, "Too many wallets");
        require(_addressToProfileId[msg.sender] == 0, "Profile already exists for this address");

        uint256 profileId = ++_currentProfileId;
        _profileIds.increment();
        uint256 newProfileId = _profileIds.current();

        // Create packed profile
        profiles[profileId] = PackedProfile({
            owner: msg.sender,
            createdAt: uint96(block.timestamp),
            metadataURI: metadataURI,
            zkVerified: false,
            walletCount: uint8(initialWallets.length),
            socialCount: 0
        });

        // Create full profile
        Profile storage newProfile = _profiles[newProfileId];
        newProfile.id = newProfileId;
        newProfile.owner = msg.sender;
        newProfile.name = "";
        newProfile.bio = "";
        newProfile.profileImageUri = "";
        newProfile.socialLinks = "";
        newProfile.createdAt = block.timestamp;

        // Mint NFT
        _mint(msg.sender, profileId);

        // Link initial wallets
        for (uint256 i = 0; i < initialWallets.length; i++) {
            linkedWallets[profileId][uint8(i)] = initialWallets[i];
            chainWallets[profileId][chainIds[i]] = true;
            addressToProfile[initialWallets[i]] = profileId;
            
            emit WalletLinked(profileId, initialWallets[i], chainIds[i]);
        }

        _addressToProfileId[msg.sender] = newProfileId;

        emit ProfileCreated(profileId, msg.sender, metadataURI);
        return profileId;
    }

    /**
     * @dev Link additional wallet with signature verification
     */
    function linkCrossChainWallet(
        uint256 profileId,
        address newWallet,
        uint256 chainId,
        uint256 deadline,
        bytes calldata signature
    ) external onlyProfileOwner(profileId) {
        require(block.timestamp <= deadline, "Signature expired");
        require(profiles[profileId].walletCount < MAX_WALLETS_PER_PROFILE, "Max wallets reached");
        require(addressToProfile[newWallet] == 0, "Wallet already linked");

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                LINK_WALLET_TYPEHASH,
                profileId,
                newWallet,
                chainId,
                nonces[newWallet]++,
                deadline
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == newWallet, "Invalid signature");

        // Link wallet
        uint8 walletIndex = profiles[profileId].walletCount;
        linkedWallets[profileId][walletIndex] = newWallet;
        chainWallets[profileId][chainId] = true;
        addressToProfile[newWallet] = profileId;
        profiles[profileId].walletCount++;

        emit WalletLinked(profileId, newWallet, chainId);
    }

    /**
     * @dev Batch link multiple wallets (gas optimized)
     */
    function batchLinkWallets(
        uint256 profileId,
        address[] calldata wallets,
        uint256[] calldata chainIds,
        uint256[] calldata deadlines,
        bytes[] calldata signatures
    ) external onlyProfileOwner(profileId) {
        require(wallets.length == signatures.length, "Array length mismatch");
        require(wallets.length == chainIds.length, "Array length mismatch");
        require(wallets.length == deadlines.length, "Array length mismatch");
        
        PackedProfile storage profile = profiles[profileId];
        require(profile.walletCount + wallets.length <= MAX_WALLETS_PER_PROFILE, "Too many wallets");

        uint8 currentCount = profile.walletCount;

        for (uint256 i = 0; i < wallets.length; i++) {
            require(block.timestamp <= deadlines[i], "Signature expired");
            require(addressToProfile[wallets[i]] == 0, "Wallet already linked");

            // Verify signature
            bytes32 structHash = keccak256(
                abi.encode(
                    LINK_WALLET_TYPEHASH,
                    profileId,
                    wallets[i],
                    chainIds[i],
                    nonces[wallets[i]]++,
                    deadlines[i]
                )
            );

            bytes32 hash = _hashTypedDataV4(structHash);
            address signer = hash.recover(signatures[i]);
            require(signer == wallets[i], "Invalid signature");

            // Link wallet
            linkedWallets[profileId][currentCount + uint8(i)] = wallets[i];
            chainWallets[profileId][chainIds[i]] = true;
            addressToProfile[wallets[i]] = profileId;

            emit WalletLinked(profileId, wallets[i], chainIds[i]);
        }

        profile.walletCount = currentCount + uint8(wallets.length);
    }

    /**
     * @dev Link social media accounts
     */
    function linkSocialAccount(
        uint256 profileId,
        string calldata platform,
        string calldata handle
    ) external onlyProfileOwner(profileId) {
        require(bytes(platform).length > 0, "Invalid platform");
        require(bytes(handle).length > 0, "Invalid handle");

        socialLinks[profileId][platform] = handle;
        
        // Update social count if it's a new platform
        if (bytes(socialLinks[profileId][platform]).length == 0) {
            profiles[profileId].socialCount++;
        }

        emit SocialLinked(profileId, platform, handle);
    }

    /**
     * @dev Update ZK verification status (only owner)
     */
    function updateZKVerification(uint256 profileId, bool verified) external onlyOwner {
        profiles[profileId].zkVerified = verified;
        emit ZKVerificationUpdated(profileId, verified);
    }

    /**
     * @dev Get profile data
     */
    function getProfile(uint256 profileId) external view returns (
        address owner,
        uint256 createdAt,
        string memory metadataURI,
        bool zkVerified,
        uint8 walletCount,
        uint8 socialCount
    ) {
        PackedProfile memory profile = profiles[profileId];
        return (
            profile.owner,
            profile.createdAt,
            profile.metadataURI,
            profile.zkVerified,
            profile.walletCount,
            profile.socialCount
        );
    }

    /**
     * @dev Get linked wallets for a profile
     */
    function getLinkedWallets(uint256 profileId) external view returns (address[] memory) {
        uint8 count = profiles[profileId].walletCount;
        address[] memory wallets = new address[](count);
        
        for (uint8 i = 0; i < count; i++) {
            wallets[i] = linkedWallets[profileId][i];
        }
        
        return wallets;
    }

    /**
     * @dev Check if profile has wallet on specific chain
     */
    function hasWalletOnChain(uint256 profileId, uint256 chainId) external view returns (bool) {
        return chainWallets[profileId][chainId];
    }

    /**
     * @dev Get social link for platform
     */
    function getSocialLink(uint256 profileId, string calldata platform) external view returns (string memory) {
        return socialLinks[profileId][platform];
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Update profile information
     */
    function updateProfile(string memory _name, string memory _bio, string memory _profileImageUri, string memory _socialLinks) public {
        uint256 profileId = _addressToProfileId[msg.sender];
        require(profileId != 0, "Profile does not exist for this address");

        Profile storage existingProfile = _profiles[profileId];
        existingProfile.name = _name;
        existingProfile.bio = _bio;
        existingProfile.profileImageUri = _profileImageUri;
        existingProfile.socialLinks = _socialLinks;

        emit ProfileUpdated(profileId, _name, _bio, _profileImageUri, _socialLinks);
    }

    /**
     * @dev Get profile by address
     */
    function getProfileByAddress(address _owner) public view returns (Profile memory) {
        uint256 profileId = _addressToProfileId[_owner];
        require(profileId != 0, "Profile does not exist for this address");
        return _profiles[profileId];
    }

    /**
     * @dev Get profile by ID
     */
    function getProfileById(uint256 _id) public view returns (Profile memory) {
        require(_profiles[_id].owner != address(0), "Profile does not exist for this ID");
        return _profiles[_id];
    }

    /**
     * @dev Get profile ID by address
     */
    function getProfileIdByAddress(address _owner) public view returns (uint256) {
        return _addressToProfileId[_owner];
    }

    // Modifiers
    modifier onlyProfileOwner(uint256 profileId) {
        require(ownerOf(profileId) == msg.sender, "Not profile owner");
        _;
    }

    // Override required by Solidity
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // New functions for profile registration and update
    function registerProfile(string memory _name, string memory _bio, string memory _profileImageUri) public {
        require(_addressToProfileId[msg.sender] == 0, "Profile already registered");
        uint256 profileId = ++_currentProfileId;
        _profileIds.increment();
        uint256 newProfileId = _profileIds.current();

        // Create packed profile
        profiles[profileId] = PackedProfile({
            owner: msg.sender,
            createdAt: uint96(block.timestamp),
            metadataURI: "",
            zkVerified: false,
            walletCount: 0,
            socialCount: 0
        });

        // Create full profile
        Profile storage newProfile = _profiles[newProfileId];
        newProfile.id = newProfileId;
        newProfile.owner = msg.sender;
        newProfile.name = _name;
        newProfile.bio = _bio;
        newProfile.profileImageUri = _profileImageUri;
        newProfile.socialLinks = "";
        newProfile.createdAt = block.timestamp;

        // Mint NFT
        _mint(msg.sender, profileId);

        _addressToProfileId[msg.sender] = newProfileId;

        emit ProfileRegistered(msg.sender, _name, _bio, _profileImageUri);
    }

    function updateProfile(string memory _name, string memory _bio, string memory _profileImageUri) public {
        uint256 profileId = _addressToProfileId[msg.sender];
        require(profileId != 0, "Profile not registered");

        Profile storage existingProfile = _profiles[profileId];
        existingProfile.name = _name;
        existingProfile.bio = _bio;
        existingProfile.profileImageUri = _profileImageUri;

        emit ProfileUpdated(msg.sender, _name, _bio, _profileImageUri);
    }

    function getProfile(address _owner) public view returns (string memory, string memory, string memory, bool) {
        uint256 profileId = _addressToProfileId[_owner];
        require(profileId != 0, "Profile does not exist for this address");
        Profile storage profile = _profiles[profileId];
        return (profile.name, profile.bio, profile.profileImageUri, profile.exists);
    }
}
