import { Command } from "commander";
import { Blockfrost, Lucid } from "lucid-cardano";
import { getScript } from "script";
import { parseAddress } from "validators";

const unlock = async (
  program: Command,
  address: string,
  expiration: string
) => {
  const script = getScript(program, address, expiration);
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
    program.error("Blockfrost API key doesn't match network of given address");
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
};

export { unlock };
