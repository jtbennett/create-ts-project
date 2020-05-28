import { execSync } from "child_process";
import { Arguments } from "yargs";

import { commandHandler, log } from "@jtbennett/ts-project-cli-utils";

import { TspScriptsOptions } from "./tspScriptsOptions";

export const tspHandler = <TArgs extends TspScriptsOptions>(
  commandFunc: (args: Arguments<TArgs>) => any,
) => {
  return commandHandler<TArgs>((args) => {
    const result = commandFunc(args);

    if (args.yarn) {
      log.success("Running yarn...");
      execSync("yarnpkg install", { stdio: "inherit" });
    }

    return result;
  });
};
