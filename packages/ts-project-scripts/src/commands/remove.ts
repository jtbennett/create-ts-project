import { Argv } from "yargs";

import {
  cliOptions,
  CliError,
  log,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";

const handler = tspHandler<
  TspScriptsOptions & {
    pkgName: string;
    from?: string;
    all?: boolean;
  }
>((args) => {
  if (!args.from && !args.all) {
    throw new CliError(`Either the --from or --all argument must be provided.`);
  }
  const all = Package.loadAll();

  const dependency = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.pkgName,
  );

  if (!dependency) {
    throw new PackageNotFoundError(args.pkgName);
  }

  const fromPackages = args.all
    ? all.filter((pkg) => pkg.packageJson && pkg.packageJson.name !== args.to)
    : all.filter(
        (pkg) => pkg.packageJson && pkg.packageJson.name === args.from,
      );

  if (args.from && fromPackages.length === 0) {
    throw new PackageNotFoundError(args.from);
  }

  if (fromPackages.length === 0) {
    log.warn(`No packages found with a reference to "${args.to}"`);
    // Don't bother running yarn, since we made no changes.
    args.yarn = false;
  } else {
    fromPackages.forEach((pkg) => {
      pkg.removeDependency(dependency);
    });
  }
});

export const remove = {
  command: "remove",
  describe: "Remove a reference (dependency) from one package to another",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 remove <pkg-name> --from <from>")
      .positional("pkg-name", {
        desc: "Name of the dependency to remove.",
        type: "string",
      })
      .options({
        from: {
          alias: "f",
          describe:
            "Name of the package from which the dependency is being removed.",
        },
        all: {
          alias: "a",
          describe:
            "Remove dependencies on the package from all other packages. --from is ignored.",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
