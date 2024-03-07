import fs from "fs";
import path from "path";
import appRoot from "app-root-path";
import { Command } from "commander";
import { getScript } from "script";
import { unlock } from "unlock";

const packageJson = JSON.parse(
  fs.readFileSync(path.join(appRoot.path, "package.json"), "utf-8")
);

const program = new Command()
  .name("vesting")
  .version(packageJson.version)
  .description(packageJson.description);

program
  .command("generate")
  .description("Generates a time-locked script address")
  .argument("<address>", "The address authorized to unlock the script")
  .argument(
    "<expiration>",
    "The date the script should become unlockable (in YYYY-MM-DD format)"
  )
  .action((address: string, expiration: string) => {
    console.log(getScript(program, address, expiration)?.address);
  });

program
  .command("unlock")
  .description("Unlocks a time-locked script address")
  .argument("<address>", "The address authorized to unlock the script")
  .argument(
    "<expiration>",
    "The date the script should become unlockable (in YYYY-MM-DD format)"
  )
  .action((address: string, expiration: string) =>
    unlock(program, address, expiration)
  );

export default program;
