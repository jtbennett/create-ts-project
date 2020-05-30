import { Argv } from "yargs";

import { cliOptions, CliError, log } from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { execSync } from "child_process";

const handler = tspHandler<
  TspScriptsOptions & {
    from: string;
    to: string;
    dir?: string;
  }
>((args) => {
  const all = Package.loadAll();
  const fromPkg = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.from,
  );
  const toPkg = all.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.to,
  );

  if (!fromPkg) {
    throw new CliError(
      `Package "${args.from}" was not found. The value must match the "name" property in package.json.`,
    );
  }

  if (toPkg) {
    throw new CliError(
      `Package "${args.to}" already exists. Choose a different name.`,
    );
  }

  fromPkg.rename(args.to, args.dir);

  if (args.yarn) {
    args.yarn = false;
    execSync("yarnpkg install", { stdio: "inherit" });
    execSync("yarnpkg workspaces run clean", { stdio: "inherit" });
  } else {
    log.warn(
      "You must run 'yarn' and 'yarn clean:all' or references will not work correctly.",
    );
  }
});

export const rename = {
  command: "rename",
  describe: "Add a reference (dependency) from one package to another",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 rename --from <from> --to <to> [--dir <dir>]")
      .options({
        from: {
          alias: "f",
          describe:
            "Name of the package to be renamed. Name must match what is in package.json.",
          demand: true,
        },
        to: {
          alias: "t",
          describe:
            "New name of the package. Name must match what is in package.json.",
          demand: true,
        },
        dir: {
          alias: "d",
          describe:
            "Name of the directory, if different from the new package name. " +
            'By default an npm scope like "@myorg/" is not included in the directory name.',
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
