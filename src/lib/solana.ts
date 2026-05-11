import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import { solanaConfig } from "@/lib/env";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

function treasuryKeypair() {
  if (!solanaConfig.treasurySecretKey) {
    throw new Error("Treasury key is not configured");
  }

  const secret = JSON.parse(solanaConfig.treasurySecretKey) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function stablecoinMintKey() {
  if (!solanaConfig.usdcMint) {
    throw new Error("Stablecoin mint is not configured");
  }

  return new PublicKey(solanaConfig.usdcMint);
}

function stablecoinDecimals() {
  if (!Number.isInteger(solanaConfig.stablecoinDecimals) || solanaConfig.stablecoinDecimals < 2) {
    throw new Error("Stablecoin decimals must be an integer greater than or equal to 2");
  }

  return solanaConfig.stablecoinDecimals;
}

function centsToBaseUnits(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Settlement amount must be a positive integer number of cents");
  }

  return BigInt(amountCents) * BigInt(10) ** BigInt(stablecoinDecimals() - 2);
}

function associatedTokenAddress(owner: PublicKey, mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

function createAssociatedTokenAccountInstruction(input: {
  payer: PublicKey;
  associatedToken: PublicKey;
  owner: PublicKey;
  mint: PublicKey;
}) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: input.payer, isSigner: true, isWritable: true },
      { pubkey: input.associatedToken, isSigner: false, isWritable: true },
      { pubkey: input.owner, isSigner: false, isWritable: false },
      { pubkey: input.mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(0),
  });
}

function createTransferCheckedInstruction(input: {
  source: PublicKey;
  mint: PublicKey;
  destination: PublicKey;
  owner: PublicKey;
  amount: bigint;
  decimals: number;
}) {
  const data = Buffer.alloc(10);
  data[0] = 12;
  data.writeBigUInt64LE(input.amount, 1);
  data[9] = input.decimals;

  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: input.source, isSigner: false, isWritable: true },
      { pubkey: input.mint, isSigner: false, isWritable: false },
      { pubkey: input.destination, isSigner: false, isWritable: true },
      { pubkey: input.owner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

async function ensureAtaInstruction(input: {
  connection: Connection;
  payer: PublicKey;
  owner: PublicKey;
  mint: PublicKey;
}) {
  const ata = associatedTokenAddress(input.owner, input.mint);
  const existing = await input.connection.getAccountInfo(ata, "confirmed");

  if (existing) {
    return { ata, instruction: null };
  }

  return {
    ata,
    instruction: createAssociatedTokenAccountInstruction({
      payer: input.payer,
      associatedToken: ata,
      owner: input.owner,
      mint: input.mint,
    }),
  };
}

async function treasuryBalanceBaseUnits(connection: Connection, tokenAccount: PublicKey) {
  const balance = await connection.getTokenAccountBalance(tokenAccount, "confirmed");
  return BigInt(balance.value.amount);
}

export function solanaExplorerUrl(signature: string) {
  const cluster = solanaConfig.network === "mainnet-beta" ? "" : "?cluster=devnet";
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

export function syntheticSignature(seed: string) {
  return `sim_${seed.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}_${Date.now().toString(36)}`;
}

export function treasuryPublicKey() {
  if (!solanaConfig.treasurySecretKey) {
    return null;
  }

  return treasuryKeypair().publicKey.toBase58();
}

export async function getTreasuryBalances() {
  const publicKey = treasuryPublicKey();

  if (!publicKey) {
    return {
      publicKey: null,
      tokenAccount: null,
      solBalance: null,
      stablecoinBalance: null,
      stablecoinBaseUnits: null,
      assetSymbol: solanaConfig.stablecoinSymbol,
    };
  }

  const connection = new Connection(solanaConfig.rpcUrl, "confirmed");
  const owner = new PublicKey(publicKey);
  const mint = stablecoinMintKey();
  const tokenAccount = associatedTokenAddress(owner, mint);
  const [lamports, tokenInfo] = await Promise.all([
    connection.getBalance(owner, "confirmed"),
    connection.getTokenAccountBalance(tokenAccount, "confirmed").catch(() => null),
  ]);

  return {
    publicKey,
    tokenAccount: tokenAccount.toBase58(),
    solBalance: lamports / 1_000_000_000,
    stablecoinBalance: tokenInfo
      ? Number(tokenInfo.value.uiAmountString ?? tokenInfo.value.uiAmount ?? 0)
      : 0,
    stablecoinBaseUnits: tokenInfo?.value.amount ?? "0",
    assetSymbol: solanaConfig.stablecoinSymbol,
  };
}

export async function executeStablecoinTransfer(input: {
  recipientWallet: string;
  amountCents: number;
}) {
  const payer = treasuryKeypair();
  const connection = new Connection(solanaConfig.rpcUrl, "confirmed");
  const mint = stablecoinMintKey();
  const recipient = new PublicKey(input.recipientWallet);
  const amount = centsToBaseUnits(input.amountCents);
  const decimals = stablecoinDecimals();

  const sourceAta = await ensureAtaInstruction({
    connection,
    payer: payer.publicKey,
    owner: payer.publicKey,
    mint,
  });
  const destinationAta = await ensureAtaInstruction({
    connection,
    payer: payer.publicKey,
    owner: recipient,
    mint,
  });

  if (sourceAta.instruction) {
    throw new Error("Treasury token account does not exist yet");
  }

  const treasuryBalance = await treasuryBalanceBaseUnits(connection, sourceAta.ata);
  if (treasuryBalance < amount) {
    throw new Error(
      `Treasury stablecoin balance is too low for a ${input.amountCents / 100} transfer`,
    );
  }

  const transaction = new Transaction();

  if (destinationAta.instruction) {
    transaction.add(destinationAta.instruction);
  }

  transaction.add(
    createTransferCheckedInstruction({
      source: sourceAta.ata,
      mint,
      destination: destinationAta.ata,
      owner: payer.publicKey,
      amount,
      decimals,
    }),
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
    commitment: "confirmed",
  });

  return {
    simulated: false,
    signature,
    explorerUrl: solanaExplorerUrl(signature),
    tokenMint: mint.toBase58(),
    tokenAccount: destinationAta.ata.toBase58(),
    assetSymbol: solanaConfig.stablecoinSymbol,
    amountBaseUnits: amount.toString(),
  };
}
