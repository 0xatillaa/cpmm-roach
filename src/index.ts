import {
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_AUTH,
  getATAAddress,
  getCreatePoolKeys,
  makeCreateCpmmPoolInInstruction,
  Raydium,
  TOKEN_WSOL,
  getRecentBlockHash,
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
  //create token vaults

  //create a cpmm initialize instructions
  const poolKeys = getCreatePoolKeys({
    programId: CREATE_CPMM_POOL_PROGRAM,
    configId: new PublicKey(cpmmConfigs[0].id),
    mintA: tokenA,
    mintB: tokenB,
  });

  const cpmmCreate = makeCreateCpmmPoolInInstruction(
    CREATE_CPMM_POOL_PROGRAM,
    wallet.publicKey,
    new PublicKey(cpmmConfigs[0].id),
    CREATE_CPMM_POOL_AUTH,
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
    TOKEN_PROGRAM_ID, // WSOL program id (classic not 2022)
    poolKeys.observationId,
    amountA,
    amountB,
    Math.floor(Date.now() / 1000) + 20 //20ms
  );
  
  const swapTx = createSwapTx(
    poolKeys.poolId,
    wallet,
    tokenA,
    tokenB,
    accountA.publicKey,
    accountB.publicKey,
    poolKeys.vaultA,
    poolKeys.vaultB,
   new PublicKey( cpmmConfigs[0].id),
    poolKeys.observationId,
    amountA,
    amountB,
    (await connection.getRecentBlockhash()).blockhash,
    true
  );


  jito(wallet, [
    createSwapTx,
    swapTx,
    swapTx,
    swapTx,
    swapTx
  ]);
}

main().catch((error) => console.log(error));
