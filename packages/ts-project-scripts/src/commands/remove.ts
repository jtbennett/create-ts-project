import { resolve } from "path";
import { Argv } from "yargs";

import {
  cliOptions,
  log,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { getPaths } from "../paths";

const handler = tspHandler<
  TspScriptsOptions & {
    pkgName: string;
    all?: boolean;
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
  const fromPackages = args.all
    ? all.filter(
        (pkg) => pkg.packageJson && pkg.packageJson.name !== args.pkgName,
      )
    : all.filter((pkg) => pkg.path === cwd);

  if (!args.all && fromPackages.length === 0) {
    throw new PackageNotFoundError(cwd);
  }

  if (fromPackages.length === 0) {
    log.warn(`No packages found with a reference to "${args.pkgName}"`);
    // Don't bother running yarn, since we made no changes.
    args.yarn = false;
  } else {
    fromPackages.forEach((pkg) => {
      pkg.removeDependency(dependency);
    });
  }
});

export const remove = {
  command: "remove <pkg-name>",
  describe: "Remove a dependency from the current package",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 remove <pkg-name> [--all] [--cwd <cwd>]")
      .positional("pkg-name", {
        desc: "Name of the dependency to remove.",
        type: "string",
      })
      .options({
        all: {
          alias: "a",
          describe: "Remove the dependency from all other packages.",
        },
        cwd: {
          describe:
            "Remove the dependency from the package in --cwd, instead of the actual current working directory.",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
