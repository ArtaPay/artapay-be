import express from "express";
import cors from "cors";
import {
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "*",
  })
);

// =====================================================
// Validate private key
// =====================================================
const PRIVATE_KEY = process.env.PAYMASTER_SIGNER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("ERROR: PAYMASTER_SIGNER_PRIVATE_KEY not found in .env");
  process.exit(1);
}

// Create signer account
const signerAccount = privateKeyToAccount(PRIVATE_KEY as Hex);

console.log("");
console.log("=====================================================");
console.log("   PAYMASTER SIGNER BACKEND");
console.log("=====================================================");
console.log("");
console.log(`   Signer Address: ${signerAccount.address}`);
console.log("   Make sure this address is added as authorized signer on Paymaster.");
console.log("");

/**
 * Sign Paymaster Data
 *
 * hash = keccak256(abi.encode(payer, token, validUntil, validAfter))
 */
async function signPaymasterData(params: {
  payerAddress: Address;
  tokenAddress: Address;
  validUntil: number;
  validAfter: number;
}): Promise<Hex> {
  const { payerAddress, tokenAddress, validUntil, validAfter } = params;

  const hash = keccak256(
    encodeAbiParameters(
      parseAbiParameters("address, address, uint256, uint256"),
      [payerAddress, tokenAddress, BigInt(validUntil), BigInt(validAfter)]
    )
  );

  const signature = await signerAccount.signMessage({
    message: { raw: hash },
  });

  return signature;
}

// =====================================================
// ROUTES
// =====================================================

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    signerAddress: signerAccount.address,
    message: "Backend ready. Private key loaded.",
  });
});

app.get("/signer", (_, res) => {
  res.json({
    signerAddress: signerAccount.address,
    note: "Add this address as authorized signer on Paymaster",
  });
});

/**
 * POST /sign - Sign paymaster data
 *
 * Body: {
 *   payerAddress: "0x..." (EOA payer),
 *   tokenAddress: "0x...",
 *   validUntil: 1704067200,
 *   validAfter: 0
 * }
 */
app.post("/sign", async (req, res) => {
  try {
    const { payerAddress, tokenAddress, validUntil, validAfter } = req.body;

    if (!payerAddress || !tokenAddress) {
      return res.status(400).json({
        error: "Missing required fields: payerAddress, tokenAddress",
      });
    }

    console.log("Signing request:");
    console.log(`   payer: ${payerAddress}`);
    console.log(`   token: ${tokenAddress}`);

    const signature = await signPaymasterData({
      payerAddress: payerAddress as Address,
      tokenAddress: tokenAddress as Address,
      validUntil: validUntil || Math.floor(Date.now() / 1000) + 3600,
      validAfter: validAfter || 0,
    });

    console.log("   Signed!");

    res.json({ signature });
  } catch (error) {
    console.error("Signing error:", error);
    res.status(500).json({
      error: "Signing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log("  GET  /health");
  console.log("  GET  /signer");
  console.log("  POST /sign");
});
