import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { Keypair } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import { AnchorSolanaPay } from "../target/types/anchor_solana_pay";
import fs from "fs";

describe("anchor-solana-pay", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  //get the anchor Solana Pay program
  const program = anchor.workspace.AnchorSolanaPay as Program<AnchorSolanaPay>;

  //get the event organizer data -> readying the public key
  const rawdata = fs.readFileSync(
    "tests/keys/fun8eenPrVMJtiQNE7q1iBVDNuY2Lbnc3x8FFgCt43N.json"
  )
  const keyData = JSON.parse(rawdata.toString());
  const eventOrganizer = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(keyData)
  )

  //generate a new Game ID
  const gameId = Keypair.generate().publicKey;

  //get the user state PDA
  const [userStatePDA] = web3.PublicKey.findProgramAddressSync([
    //game id and user's public key
    gameId.toBuffer(), provider.wallet.publicKey.toBuffer()
  ],program.programId);


  it("is initialized", async () => {
    // Add your test here.
    const tx = await program.methods.initialize(gameId).rpc();

    //get the user state using the program's accounts
    const userState = await program.account.userState.fetch(userStatePDA);
  });

  it("check in", async() =>{
    const location = Keypair.generate().publicKey;;

    //checking in using the function
    const tx = await program.methods
    .checkIn(gameId,location)
    .accounts({})
    .signers([eventOrganizer])
    .rpc();

    //fetch updated user state
    const userState = await program.account.userState.fetch(userStatePDA);
    console.log("Location checked in first is : ",location.toBase58());
    assert.isTrue(userState.lastLocation.equals(location));
  });

  it("check in again", async() =>{
    const location = Keypair.generate().publicKey;;

    //checking in using the function
    const tx = await program.methods
    .checkIn(gameId,location)
    .accounts({})
    .signers([eventOrganizer])
    .rpc();

    //fetch updated user state
    const userState = await program.account.userState.fetch(userStatePDA);
    console.log("Location checked in second is : ",location.toBase58());
    assert.isTrue(userState.lastLocation.equals(location));
  });


});
