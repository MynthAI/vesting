import {
  getAddressDetails,
  Network,
  SLOT_CONFIG_NETWORK,
  unixTimeToEnclosingSlot,
} from "lucid-cardano";
import { Err, Ok, Result } from "ts-res";
import { Address } from "types";

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

export { getExpirySlot, parseAddress };
