import { Argv } from "yargs";

import { commandHandler, cliOptions } from "@jtbennett/ts-project-cli-utils";

import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";

const handler = commandHandler<
  TspScriptsOptions & {
    pkgName: string;
    force?: boolean;
  }
>((args) => {
  new Package({ name: args.pkgName, dryRun: !!args.dryRun }).delete(
    !!args.force,
  );
});

export const removePackage = {
  command: "remove <pkg-name>",
  describe: "Remove a package",

  builder: (yargs: Argv) =>
    yargs
      .positional("pkg-name", {
        desc: "Name of the package to remove.",
        type: "string",
      })
      .options({
        force: {
          boolean: true,
          describe:
            "Allow removal when references to the package exist. References will also be removed.",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
