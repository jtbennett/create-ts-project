import { Argv } from "yargs";

import {
  cliOptions,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";

const handler = tspHandler<
  TspScriptsOptions & {
    pkgName: string;
    to: string;
  }
>((args) => {
  const all = Package.loadAll();

  const dependency = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.pkgName,
  );

  const toPkg = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.to,
  );

  if (!dependency) {
    throw new PackageNotFoundError(args.pkgName);
  }

  if (!toPkg) {
    throw new PackageNotFoundError(args.to);
  }

  toPkg.addDependency(dependency);
});

export const add = {
  command: "add",
  describe: "Add a dependency from one package to another",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 add <pkg-name> --to <to>")
      .positional("pkg-name", {
        desc: "Name of the dependency to add.",
        type: "string",
      })
      .options({
        to: {
          alias: "t",
          describe:
            "Name of the package to which the dependency will be added.",
          demand: true,
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
