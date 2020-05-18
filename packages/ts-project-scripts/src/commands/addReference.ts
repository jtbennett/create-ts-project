import { Argv } from "yargs";

import { commandHandler, cliOptions, CliError } from "@jtbennett/ts-project-cli-utils";

import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";

const handler = commandHandler<
  TspScriptsOptions & {
    from: string;
    to: string;
  }
>((args) => {
  const all = Package.loadAll();
  const fromPkg = all.find((pkg) => pkg.packageJson!.name === args.from);
  const toPkg = all.find((pkg) => pkg.packageJson!.name === args.to);

  const pkgNotFoundError = (name: string) =>
    new CliError(
      `Package "${name}" was not found. The value must match the "name" property in package.json.`,
    );

  if (!fromPkg) {
    throw pkgNotFoundError(args.from);
  }

  if (!toPkg) {
    throw pkgNotFoundError(args.to);
  }

  fromPkg.addReferenceTo(toPkg);
});

export const addReference = {
  command: "ref",
  describe: "Add a reference/dependency from one package to another",

  builder: (yargs: Argv) =>
    yargs.options({
      from: {
        alias: "f",
        describe:
          "Name of the package that will depend on the package in --to. Name must match what is in package.json.",
        demand: true,
      },
      to: {
        alias: "t",
        describe:
          "Name of the package that will be depended upon by --from. Name must match what is in package.json.",
        demand: true,
      },
      ...cliOptions,
      ...tspScriptsOptions,
    }),

  handler,
};
