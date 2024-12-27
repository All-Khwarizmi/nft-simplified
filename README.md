# ERC721 NFT Implementation 🎨

A gas-optimized ERC721 NFT implementation with operator delegation and minting capabilities. Built with security and flexibility in mind.

## 🌟 Features

- Fee-based minting (0.01 ETH)
- Maximum supply cap (1000 NFTs)
- Operator delegation system
- Per-token approval mechanism
- Comprehensive security checks
- Gas optimized storage

## 🔗 Contract Information

- **Network**: Sepolia Testnet
- **Contract Address**: `0x0b797f19398e6F3D9D512B7326828ea12D5Db272` [View on Etherscan](https://sepolia.etherscan.io/address/0x0b797f19398e6F3D9D512B7326828ea12D5Db272)

## 🛠 Technical Specifications

### Core Components

```solidity
// Key Storage Structures
mapping(address => uint256) public balances;
mapping(uint256 => address) private idToOwner;
mapping(address => mapping(address => bool)) public delegatedOperators;
mapping(uint256 => address) private approvedAddress;
```

### Key Functions

- `mint()` - Mint new NFT (requires 0.01 ETH)
- `transferFrom(address from, address to, uint256 tokenId)` - Transfer NFT ownership
- `approve(address approved, uint256 tokenId)` - Approve specific NFT transfer
- `setApprovalForAll(address operator, bool approved)` - Set operator approval

## 🔒 Security Features

1. Ownership Validation

   - Zero address checks
   - Token existence verification
   - Authorization controls

2. Access Control

   - Owner permissions
   - Operator delegation
   - Per-token approvals

3. Supply Management
   - Fixed maximum supply
   - Safe minting process
   - Balance tracking

## 📦 Installation & Deployment

This contract was deployed using Hardhat and Ignition. For detailed deployment instructions, check our [Smart Contract Deployment Guide](https://gist.github.com/All-Khwarizmi/ce94a819bd28fb301a46e6d98eadec8c).

### Quick Start

```bash
# Install dependencies
npm install

# Deploy contract
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 🎯 Design Decisions

1. Storage Architecture

   - Separate mappings for flexibility
   - Clear ownership tracking
   - Optimized gas usage

2. Authorization Model

   - Single owner per NFT
   - Multiple operators possible
   - One approved address per NFT

3. Error Handling
   - Custom error messages
   - Comprehensive checks
   - Clear error reporting

## 📊 Events

The contract emits standard ERC721 events:

- `Transfer(address from, address to, uint256 tokenId)`
- `Approval(address owner, address approved, uint256 tokenId)`
- `ApprovalForAll(address owner, address operator, bool approved)`

## 🧪 Testing

```bash
# Run test suite
npx hardhat test

# Check coverage
npx hardhat coverage
```

## 📋 Contract Interface

Implements standard ERC721 interface:

- Basic ownership functions
- Transfer mechanisms
- Approval system
- Metadata handling

## 🔍 Contract Verification

The contract is verified on Etherscan with:

- Solidity Version: 0.8.28
- Optimizer: Enabled
- License: MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For any questions or feedback:

- GitHub: [All-Khwarizmi](https://github.com/All-Khwarizmi/)
- Twitter: [@swarecito](https://twitter.com/swarecito)
