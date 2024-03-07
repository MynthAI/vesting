import { Command } from "commander";
import { C, fromHex, nativeScriptFromJson } from "lucid-cardano";
import { Address } from "types";
import { getExpirySlot, parseAddress } from "validators";

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

const getScript = (program: Command, address: string, expiration: string) => {
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

export { getScript };
