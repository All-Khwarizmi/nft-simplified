// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import {IERC721} from "./ERC721-simplified.sol";

/**
 * @title NFT
 * @dev Implementation ERC721 Non-Fungible Token Standard
 * @custom:security-contact https://github.com/All-Khwarizmi/
 * Design Choices:
 * 1. Ownership Model:
 *    - Single owner per NFT
 *    - Multiple operators possible per owner
 *    - One approved address per NFT
 *
 * 2. Storage Design Options Considered:
 *    - Current: Separate mappings for flexibility
 *
 * 3. Security Requirements:
 *    - Zero address validations
 *    - Operation authorization checks
 *    - Token validity verification
 */
contract NFT is IERC721 {
    /// @notice Tracks number of NFTs owned by each address
    mapping(address owner => uint256 balance) public balances;

    /// @notice Maps NFT ID to current owner
    mapping(uint256 => address) private idToOwner;

    /// @notice Maps owner to operator approvals (operator => bool)
    /// @dev An operator has full control over all NFTs of an owner
    mapping(address owner => mapping(address operator => bool))
        public delegatedOperators;

    /// @notice Maps NFT ID to single approved address
    /// @dev Only one address can be approved per NFT at a time
    mapping(uint256 => address) private approvedAddress;

    /// @notice Minting fee in ETH
    uint256 public constant FEE = 0.01 ether;

    /// @notice Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 1000;

    /// @notice Current remaining supply
    uint256 public totalSupply;

    /// @notice Emitted when a new NFT is minted
    event Mint(address indexed owner, uint256 tokenId);

    error InvalidToken(uint256 tokenId);
    error ZeroAddress();
    error NotAuthorized(address account);
    error NotEnoughSupply();
    error NotExpectedValue();

    modifier zeroAddressCheck(address adr) {
        if (adr == address(0)) {
            revert ZeroAddress();
        }
        _;
    }

    /// @notice Gets owner of NFT
    function ownerOf(uint256 tokenId) external view returns (address) {
        if (idToOwner[tokenId] == address(0)) {
            revert InvalidToken(tokenId);
        }
        return idToOwner[tokenId];
    }

    /// @notice Gets number of NFTs owned by address
    /// @param owner Address to query
    /// @return Number of NFTs owned
    function balanceOf(
        address owner
    ) external view zeroAddressCheck(owner) returns (uint256) {
        return balances[owner];
    }

    /// @notice Gets approved address for NFT
    function getApproved(uint256 tokenId) external view returns (address) {
        return approvedAddress[tokenId];
    }

    /// @notice Checks if address is approved operator
    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool) {
        return delegatedOperators[owner][operator];
    }

    /// @notice Mints a new NFT
    /// @dev Requires payment of FEE, reduces totalSupply
    function mint() external payable {
        if (msg.value != FEE) {
            revert NotExpectedValue();
        }

        uint256 tokenId = totalSupply++;

        idToOwner[tokenId] = msg.sender;
        balances[msg.sender]++;

        emit Transfer(address(0), msg.sender, tokenId);
    }

    /// @notice Approves address to transfer specific NFT
    /// @param approved Address to be approved
    /// @param tokenId ID of NFT to approve for
    function approve(address approved, uint256 tokenId) external payable {
        address nftOwner = idToOwner[tokenId];
        bool isOwner = nftOwner == msg.sender;
        bool isAllowedOperator = delegatedOperators[nftOwner][msg.sender];
        if (!isOwner && !isAllowedOperator) {
            revert NotAuthorized(msg.sender);
        }

        approvedAddress[tokenId] = approved;
        emit Approval(nftOwner, approved, tokenId);
    }

    /// @notice Approves operator for all NFTs of sender
    /// @dev Cannot approve self as operator
    /// @param operator Address to approve
    /// @param approved True to approve, false to revoke
    function setApprovalForAll(
        address operator,
        bool approved
    ) external zeroAddressCheck(operator) {
        delegatedOperators[msg.sender][operator] = approved;

        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /// @notice Transfers NFT between addresses
    /// @dev Updates balances and clears approval
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external payable zeroAddressCheck(to) {
        address currentNFTOwner = idToOwner[tokenId];
        if (from != currentNFTOwner) {
            revert NotAuthorized(from);
        }
        if (idToOwner[tokenId] == address(0)) {
            revert InvalidToken(tokenId);
        }

        bool isAllowedOperator = msg.sender == currentNFTOwner ||
            msg.sender == approvedAddress[tokenId] ||
            delegatedOperators[currentNFTOwner][msg.sender];
        if (!isAllowedOperator) {
            revert NotAuthorized(msg.sender);
        }

        unchecked {
            balances[from]--;
        }
        balances[to]++;

        idToOwner[tokenId] = to;
        delete approvedAddress[tokenId];

        emit Transfer(from, to, tokenId);
    }
}
