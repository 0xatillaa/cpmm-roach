import {
  DEV_CREATE_CPMM_POOL_AUTH,
  DEV_CREATE_CPMM_POOL_PROGRAM,
  getATAAddress,
  getCreatePoolKeys,
  makeCreateCpmmPoolInInstruction,
  Raydium,
  TOKEN_WSOL,
} from "@raydium-io/raydium-sdk-v2";
import {
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import wallet from "./wallets";
import createSwapTx from "./swaps";
import jito from "./jito";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tokenA = new PublicKey("CLcondx9VLureigx2RDCoUF2wACQ7fCR5kz4h9RyWVDE");
  const tokenB = new PublicKey(TOKEN_WSOL.address);

  const amountA = 1000;
  const amountB = 1000;

  const raydium = await Raydium.load({
    owner: wallet,
    connection,
    disableLoadToken: false,
  });

  const tokenAccs = await raydium.account.fetchWalletTokenAccounts();
  const accountA = tokenAccs.tokenAccounts.find((oneTokenAcc) =>
    oneTokenAcc.mint.equals(tokenA)
  );
  console.log(accountA);
  //  find the token accounts with mint A and B
  const accountB = tokenAccs.tokenAccounts.find((oneToken) =>
    oneToken.mint.equals(NATIVE_MINT)
  );
  console.log(accountB);
  //get cpmm configs
  const cpmmConfigs = await raydium.api.getCpmmConfigs();
  console.log(cpmmConfigs);
  //create token vaults

  //create a cpmm initialize instructions
  const poolKeys = getCreatePoolKeys({
    programId: DEV_CREATE_CPMM_POOL_PROGRAM,
    configId: new PublicKey(cpmmConfigs[0].id),
    mintA: tokenA,
    mintB: tokenB,
  });

  const cpmmCreate = makeCreateCpmmPoolInInstruction(
    DEV_CREATE_CPMM_POOL_PROGRAM,
    wallet.publicKey,
    new PublicKey(cpmmConfigs[0].id),
    DEV_CREATE_CPMM_POOL_AUTH,
    poolKeys.poolId,
    tokenA,
    tokenB,
    poolKeys.lpMint,
    poolKeys.vaultA,
    poolKeys.vaultB,
    getATAAddress(wallet.publicKey, poolKeys.lpMint).publicKey,
    poolKeys.vaultA,
    poolKeys.vaultB,
    wallet.publicKey,
    TOKEN_2022_PROGRAM_ID, // your tokens program id
    TOKEN_PROGRAM_ID, // WSOL is classic
    poolKeys.observationId,
    amountA,
    amountB,
    Math.floor(Date.now() / 1000) + 20 //20ms
  );
  const firstSwapTx = createSwapTx();

  const secondSwapTx = createSwapTx();

  const thirdSwapTx = createSwapTx();

  const fourthSwapTx = createSwapTx();

  jito(wallet, [
    createSwapTx,
    firstSwapTx,
    secondSwapTx,
    thirdSwapTx,
    fourthSwapTx,
  ]);
}

main().catch((error) => console.log(error));
