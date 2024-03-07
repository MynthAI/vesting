import { Command } from "commander";
import {
  Blockfrost,
  C,
  Credential,
  fromHex,
  getAddressDetails,
  Lucid,
  nativeScriptFromJson,
  Network,
  SLOT_CONFIG_NETWORK,
  unixTimeToEnclosingSlot,
} from "lucid-cardano";
import { Err, Ok, Result } from "ts-res";

const generateScript = (owner: Address, expirySlot: number) => {
  const script = nativeScriptFromJson({
    type: "all",
    scripts: [
      {
        type: "sig",
        keyHash: owner.paymentCredential.hash,
      },
      {
        type: "after",
        slot: expirySlot,
      },
    ],
  });

  const address = C.BaseAddress.new(
    owner.networkId,
    C.StakeCredential.from_scripthash(
      C.NativeScript.from_bytes(fromHex(script.script)).hash(
        C.ScriptHashNamespace.NativeScript
      )
    ),
    C.StakeCredential.from_keyhash(
      C.Ed25519KeyHash.from_hex(owner.stakeCredential.hash)
    )
  )
    .to_address()
    .to_bech32(undefined);

  return { script, address };
};

type Address = {
  networkId: number;
  paymentCredential: Credential;
  stakeCredential: Credential;
};

const parseAddress = (address: string): Result<Address, string> => {
  try {
    const { networkId, paymentCredential, stakeCredential } =
      getAddressDetails(address);

    if (!paymentCredential || !stakeCredential) return Err("Invalid address");

    return Ok({ networkId, paymentCredential, stakeCredential });
  } catch (error) {
    return Err("Invalid address");
  }
};

const getExpirySlot = (
  expiration: string,
  networkId: number
): Result<number, string> => {
  const date = new Date(expiration);
  const network: Network = networkId === 1 ? "Mainnet" : "Preview";

  try {
    const slot = unixTimeToEnclosingSlot(
      date.getTime(),
      SLOT_CONFIG_NETWORK[network]
    );

    return slot > 0 ? Ok(slot) : Err("Date must be after Cardano launched!");
  } catch (error) {
    return Err("Invalid date provided");
  }
};

const getScript = (address: string, expiration: string) => {
  const details = parseAddress(address);

  if (!details.ok) {
    program.error(details.error);
    return;
  }

  const slot = getExpirySlot(expiration, details.data.networkId);

  if (!slot.ok) {
    program.error(slot.error);
    return;
  }

  return generateScript(details.data, slot.data);
};

const program = new Command();
program
  .command("generate")
  .description("Generates a time-locked script address")
  .argument("<address>", "The address authorized to unlock the script")
  .argument(
    "<expiration>",
    "The date the script should become unlockable (in YYYY-MM-DD format)"
  )
  .action((address: string, expiration: string) => {
    console.log(getScript(address, expiration)?.address);
  });

program
  .command("unlock")
  .description("Unlocks a time-locked script address")
  .argument("<address>", "The address authorized to unlock the script")
  .argument(
    "<expiration>",
    "The date the script should become unlockable (in YYYY-MM-DD format)"
  )
  .action(async (address: string, expiration: string) => {
    const script = getScript(address, expiration);
    if (!script) return;

    const blockfrostApiKey = process.env["BLOCKFROST_API_KEY"];
    const details = parseAddress(address);
    if (!details.ok) return;
    const networkId = details.data.networkId;

    if (!blockfrostApiKey) {
      program.error("BLOCKFROST_API_KEY environment variable must be set");
      return;
    }

    const network = blockfrostApiKey.substring(0, 7);

    if (
      (network === "mainnet" && networkId !== 1) ||
      (network === "preview" && networkId !== 0)
    ) {
      program.error(
        "Blockfrost API key doesn't match network of given address"
      );
      return;
    }

    const lucid = await Lucid.new(
      new Blockfrost(
        `https://cardano-${network}.blockfrost.io/api/v0`,
        blockfrostApiKey
      ),
      network == "mainnet" ? "Mainnet" : "Preview"
    );
    lucid.selectWalletFrom({ address });

    const utxos = await lucid.utxosAt(script.address);

    if (!utxos.length) {
      program.error("Script is empty");
      return;
    }

    const tx = await lucid
      .newTx()
      .validFrom(Date.now() - 60000)
      .validTo(Date.now() + 2000000)
      .collectFrom(utxos)
      .attachSpendingValidator(script.script)
      .addSigner(address)
      .complete();

    console.log(tx.toString());
  });

program.parse(process.argv);
