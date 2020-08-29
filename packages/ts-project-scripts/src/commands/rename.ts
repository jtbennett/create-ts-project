import { execSync } from "child_process";
import { resolve } from "path";
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
import { getPaths } from "../paths";

const handler = tspHandler<
  TspScriptsOptions & {
    newPkgName: string;
    dir?: string;
    cwd?: string;
  }
>((args) => {
  const all = Package.loadAll();

  const cwd = args.cwd ? resolve(getPaths().rootPath, args.cwd) : process.cwd();
  const currentPkg = all.find((pkg) => pkg.path === cwd);

  if (!currentPkg) {
    throw new PackageNotFoundError(cwd);
  }

  const toPkg = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.newPkgName,
  );

  if (toPkg) {
    throw new CliError(
      `Package "${args.newPkgName}" already exists. Choose a different name.`,
    );
  }

  currentPkg.rename(args.newPkgName, args.dir);

  if (args.yarn) {
    args.yarn = false;
    execSync("yarnpkg install", { stdio: "inherit" });
    execSync("yarnpkg run clean:all", { stdio: "inherit" });
  } else {
    log.warn(
      "You must run 'yarn' and 'yarn clean:all' or references will not work correctly.",
    );
  }
});

export const rename = {
  command: "rename <new-pkg-name>",
  describe: "Rename the current package",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 rename <new-pkg-name> [--dir <dir>] [--cwd <cwd>]")
      .positional("pkg-name", {
        describe: "New name of the package. Will be written to package.json.",
        type: "string",
      })
      .options({
        dir: {
          alias: "d",
          describe:
            "Name of the new directory, if different from the new package name. " +
            'By default an npm scope like "@myorg/" is not included in the directory name.',
        },
        cwd: {
          describe:
            "Rename the package in --cwd, instead of the actual current working directory.",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
