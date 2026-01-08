# ArtaPay Backend

Backend service for ArtaPay dApp that signs Paymaster data and builds StableSwap
calldata for gasless stablecoin transactions on Lisk Sepolia.

## Overview

ArtaPay Backend provides:

- **Paymaster Signing**: Generates signatures for ERC-4337 paymaster validation
- **Swap Quotes**: Reads on-chain StableSwap quotes for token conversions
- **Swap Calldata Builder**: Encodes `swap()` calls for smart accounts/wallets
- **Health + Signer Info**: Simple endpoints for monitoring and integration

## Architecture

### Core Modules

#### 1. **Express API** - HTTP Service

Main HTTP server providing JSON endpoints.

**Key Features:**

- CORS configuration via env
- JSON request/response
- Health and signer discovery endpoints

#### 2. **Paymaster Signer** - Signature Service

Signs paymaster data for gasless transactions.

**Key Features:**

- Uses a dedicated signer private key
- Hash: `keccak256(abi.encode(payer, token, validUntil, validAfter))`
- Compatible with Paymaster validation logic

**Main Functions:**

- `signPaymasterData()` - Builds and signs the paymaster hash

#### 3. **StableSwap Helper** - Quote + Calldata

Reads quotes and encodes swap calldata for StableSwap.

**Key Features:**

- Uses `getSwapQuote()` on-chain
- Encodes `swap()` calldata for client usage
- Validates addresses and amounts

**Main Functions:**

- `getSwapQuote()` (via `readContract`)
- `buildSwapCalldata()` (via `encodeFunctionData`)

## Fee Structure

This backend does not charge fees. On-chain fees are defined in the smart
contracts (see `artapay-sc`).

| Fee Type       | Rate          | Paid By | Token      |
| -------------- | ------------- | ------- | ---------- |
| Gas Fee Markup | 5% (500 BPS)  | Payer   | Stablecoin |
| Platform Fee   | 0.3% (30 BPS) | Payer   | Stablecoin |
| Swap Fee       | 0.1% (10 BPS) | User    | Stablecoin |

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# From repo root
cd artapay-be

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# =====================================================
# PAYMASTER SIGNER BACKEND CONFIGURATION
# =====================================================

# IMPORTANT: This must be a PRIVATE KEY, not an address
PAYMASTER_SIGNER_PRIVATE_KEY=0x...

# RPC endpoint for reading StableSwap (quotes/calldata)
RPC_URL=https://rpc.sepolia-api.lisk.com

# StableSwap contract address (for quote/build)
STABLE_SWAP_ADDRESS=0x...

# Server port
PORT=3001

# Allowed CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5173
```

## Testing

No automated tests are included yet.

## Deployment

### Run Locally (Watch Mode)

```bash
npm run dev
```

### Run Server

```bash
npm run start
```

### Build TypeScript

```bash
npm run build
```

## Network Information

### Lisk Sepolia Testnet

- **Chain ID**: 4202
- **RPC URL**: https://rpc.sepolia-api.lisk.com
- **Block Explorer**: https://sepolia-blockscout.lisk.com
- **EntryPoint v0.7**: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

## Supported Stablecoins

| Symbol | Name               | Decimals | Region |
| ------ | ------------------ | -------- | ------ |
| USDC   | USD Coin           | 6        | US     |
| USDT   | Tether USD         | 6        | US     |
| IDRX   | Indonesia Rupiah   | 6        | ID     |
| JPYC   | JPY Coin           | 8        | JP     |
| EURC   | Euro Coin          | 6        | EU     |
| MXNT   | Mexican Peso Token | 6        | MX     |
| CNHT   | Chinese Yuan Token | 6        | CN     |

## Contract Addresses

### Lisk Sepolia (Testnet)

```
EntryPoint:            0x0000000071727De22E5E9d8BAf0edAc6f37da032
Paymaster:             <DEPLOYED_ADDRESS>
StablecoinRegistry:    <DEPLOYED_ADDRESS>
StableSwap:            <DEPLOYED_ADDRESS>
PaymentProcessor:      <DEPLOYED_ADDRESS>
```

## Security Considerations

- **Private Key Management**: Never commit private keys. Use environment files.
- **Signer Permissions**: Use a dedicated signer with limited authority.
- **CORS Control**: Restrict `CORS_ORIGINS` to trusted frontends.
- **Rate Limiting**: Add a reverse proxy if exposing this publicly.
- **Input Validation**: Addresses and amounts are validated server-side.

## Development

### Code Style

This project uses:

- TypeScript
- Express for HTTP APIs
- viem for EVM interactions

### Project Structure

```
artapay-be/
|-- src/
|   |-- index.ts        # API server and signer logic
|-- .env.example        # Environment template
|-- package.json
|-- tsconfig.json
```

## License

MIT License - see LICENSE file for details