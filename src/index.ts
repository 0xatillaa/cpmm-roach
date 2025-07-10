import { DEV_CREATE_CPMM_POOL_PROGRAM, DEVNET_PROGRAM_ID, getCreatePoolKeys, makeCreateCpmmPoolInInstruction, Raydium, solToWSol, TOKEN_WSOL } from "@raydium-io/raydium-sdk-v2";
import { createNativeMint, getOrCreateAssociatedTokenAccount, NATIVE_MINT, NATIVE_MINT_2022, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tokenA = new PublicKey("CLcondx9VLureigx2RDCoUF2wACQ7fCR5kz4h9RyWVDE");
  const tokenB = new PublicKey(TOKEN_WSOL.address);

  const wallet = Keypair.fromSecretKey(
    new Uint8Array([
      46, 249, 12, 118, 162, 23, 101, 52, 46, 255, 71, 6, 186, 221, 190, 187,
      131, 196, 233, 154, 1, 115, 170, 82, 2, 207, 246, 125, 62, 165, 200, 85,
      225, 69, 168, 119, 193, 208, 70, 219, 0, 93, 150, 153, 25, 185, 134, 116,
      217, 151, 222, 155, 142, 25, 221, 183, 110, 216, 60, 73, 192, 126, 121,
      100,
    ])
  );
  const raydium = await Raydium.load({
    owner: wallet,
    connection,
    disableLoadToken: false

  });

  const tokenAccs = await raydium.account.fetchWalletTokenAccounts();
  const accountA = tokenAccs.tokenAccounts.find((oneTokenAcc) => oneTokenAcc.mint.equals(tokenA));
  console.log(accountA);
 //  find the token accounts with mint A and B
 const accountB = tokenAccs.tokenAccounts.find((oneToken) => oneToken.mint.equals(NATIVE_MINT));
 console.log(accountB);
 //get cpmm configs
 const cpmmConfigs = await raydium.api.getCpmmConfigs();
 console.log(cpmmConfigs);
 //create a cpmm initialize instructions
 const poolKeys = getCreatePoolKeys({
    programId: DEV_CREATE_CPMM_POOL_PROGRAM,
    configId: new PublicKey(cpmmConfigs[0].id),
    mintA: mint


 });
 const cpmmCreate = makeCreateCpmmPoolInInstruction(
    DEV_CREATE_CPMM_POOL_PROGRAM,
    wallet.publicKey,
    new PublicKey(cpmmConfigs[0].id),



 )

}

main().catch((error) => console.log(error));
