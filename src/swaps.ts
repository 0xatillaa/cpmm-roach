import { CREATE_CPMM_POOL_AUTH, CREATE_CPMM_POOL_PROGRAM, makeSwapCpmmBaseInInstruction } from "@raydium-io/raydium-sdk-v2";
import { NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { MessageV0, Transaction, TransactionMessage, VersionedMessage, VersionedTransaction } from "@solana/web3.js";

export default async function createSwapTx(
  poolId,
  payer,
  tokenA,
  tokenB,
  tokenAccountA,
  tokenAccountB,
  vaultA,
  vaultB,

  configId,
  observationId,
  amountIn,
  amountOut,
  recentBlockhash,


  createWallets = true
) {
  // can fit 5 swaps IX into 1 transaction
  // then 4 swap transactions in a bundle, first is taken
  // by create pool
  console.log("args:",
  
  amountIn,
amountOut);

  
  const instruction = makeSwapCpmmBaseInInstruction(
    CREATE_CPMM_POOL_PROGRAM,
    payer.publicKey,
    CREATE_CPMM_POOL_AUTH,
    new PublicKey(configId),  
    poolId,
    tokenAccountA,
    tokenAccountB,
    vaultA,
    vaultB,
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenA,
    tokenB,
    observationId,
    amountIn,
    amountOut
  );
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    instructions: [instruction, instruction, instruction, instruction, instruction],
    recentBlockhash
  }).compileToV0Message()
  const transaction = new VersionedTransaction(message);
  // sign and return
   transaction.sign([payer])
   return transaction;
}
