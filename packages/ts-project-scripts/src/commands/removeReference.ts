import { Argv } from "yargs";

import { cliOptions, CliError, log } from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";

const pkgNotFoundError = (name: string) =>
  new CliError(
    `Package "${name}" was not found. The value must match the "name" property in package.json.`,
  );

const handler = tspHandler<
  TspScriptsOptions & {
    from: string;
    all?: boolean;
    to: string;
  }
>((args) => {
  const all = Package.loadAll();

  const fromPackages = args.all
    ? all.filter((pkg) => pkg.packageJson!.name !== args.to)
    : all.filter((pkg) => pkg.packageJson!.name === args.from);

  const toPackage = all.find((pkg) => pkg.packageJson!.name === args.to);

  if (args.from !== "*" && fromPackages.length === 0) {
    throw pkgNotFoundError(args.from);
  }

  if (!toPackage) {
    throw pkgNotFoundError(args.to);
  }

  if (fromPackages.length === 0) {
    log.warn(`No packages found with a reference to "${args.to}"`);
    // Don't bother running yarn, since we made no changes.
    args.yarn = false;
  } else {
    fromPackages.forEach((pkg) => {
      pkg.removeReferenceTo(toPackage);
    });
  }
});

export const removeReference = {
  command: "unref",
  describe: "Remove a reference/dependency from one package to another",

  builder: (yargs: Argv) =>
    yargs.options({
      from: {
        alias: "f",
        describe:
          "Name of the package that depends on the package in --to. Name must match what is in package.json.",
      },
      all: {
        alias: "a",
        describe:
          "Remove references to the package in --to from all other packages. --from is ignored.",
      },
      to: {
        alias: "t",
        describe:
          "Name of the package is depended upon by --from. Name must match what is in package.json.",
        demand: true,
      },
      ...cliOptions,
      ...tspScriptsOptions,
    }),

  handler,
};
