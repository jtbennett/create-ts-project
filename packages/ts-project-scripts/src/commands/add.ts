import { resolve } from "path";
import { Argv } from "yargs";

import {
  cliOptions,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { getPaths } from "../paths";

const handler = tspHandler<
  TspScriptsOptions & {
    pkgName: string;
    cwd?: string;
  }
>((args) => {
  const all = Package.loadAll();

  const dependency = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.pkgName,
  );

  if (!dependency) {
    throw new PackageNotFoundError(args.pkgName);
  }

  const cwd = args.cwd ? resolve(getPaths().rootPath, args.cwd) : process.cwd();
  const toPkg = all.find((pkg) => pkg.path === cwd);

  if (!toPkg) {
    throw new PackageNotFoundError(cwd);
  }

  toPkg.addDependency(dependency);
});

export const add = {
  command: "add <pkg-name>",
  describe: "Add a dependency to the current package",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 add <pkg-name> [--cwd <cwd>]")
      .positional("pkg-name", {
        desc: "Name of the dependency to add.",
        type: "string",
      })
      .options({
        cwd: {
          describe:
            "Add the dependency to the package in --cwd, instead of the actual current working directory.",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
