import { Argv } from "yargs";

import { handlerWrapper } from "../handlerWrapper";
import { globalOptions } from "../options";
import { Package } from "../Package";
import { TspError } from "../TspError";

const handler = handlerWrapper<{
  from: string;
  to: string;
}>((args) => {
  const all = Package.loadAll();
  const fromPkg = all.find((pkg) => pkg.packageJson!.name === args.from);
  const toPkg = all.find((pkg) => pkg.packageJson!.name === args.to);

  const pkgNotFoundError = (name: string) =>
    new TspError(
      `Package "${name}" was not found. The value must match the "name" property in package.json.`,
    );

  if (!fromPkg) {
    throw pkgNotFoundError(args.from);
  }

  if (!toPkg) {
    throw pkgNotFoundError(args.to);
  }

  fromPkg.removeReferenceTo(toPkg);
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
        demand: true,
      },
      to: {
        alias: "t",
        describe:
          "Name of the package is depended upon by --from. Name must match what is in package.json.",
        demand: true,
      },
      ...globalOptions,
    }),

  handler,
};
