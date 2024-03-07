import { Credential } from "lucid-cardano";

type Address = {
  networkId: number;
  paymentCredential: Credential;
  stakeCredential: Credential;
};

export { Address };
