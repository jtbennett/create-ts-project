import { Argv } from "yargs";

import { cliOptions, CliError } from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";

const handler = tspHandler<
  TspScriptsOptions & {
    from: string;
    to: string;
  }
>((args) => {
  const all = Package.loadAll();
  const fromPkg = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.from,
  );
  const toPkg = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.to,
  );

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

export const ref = {
  command: "ref",
  describe: "Add a reference (dependency) from one package to another",

  builder: (yargs: Argv) =>
    yargs.usage("Usage: $0 ref --from <from> --to <to>").options({
      from: {
        alias: "f",
        describe:
          "Name of the package that will reference (depend on) the --to package. Name must match what is in package.json.",
        demand: true,
      },
      to: {
        alias: "t",
        describe:
          "Name of the package that will be referenced (depended upon) by the --from package. Name must match what is in package.json.",
        demand: true,
      },
      ...cliOptions,
      ...tspScriptsOptions,
    }),

  handler,
};
