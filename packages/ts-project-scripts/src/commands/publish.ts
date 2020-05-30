import { EOL } from "os";
import { Argv } from "yargs";
import { existsSync, readFileSync } from "fs-extra";
import { join } from "path";
import { execSync } from "child_process";

import {
  commandHandler,
  cliOptions,
  CliOptions,
  CliError,
  log,
  getFiles,
} from "@jtbennett/ts-project-cli-utils";

import { Package } from "../Package";

const getNpmrcPath = () => {
  return execSync("npm config get userconfig").toString().trim();
};

const setNpmRegistryCredentials = () => {
  log.success(`Writing NPM_TOKEN to .npmrc...`);

  const files = getFiles();
  const path = getNpmrcPath();
  let originalConfig = "";
  if (existsSync(path)) {
    originalConfig = readFileSync(path).toString();
  }

  let lines = originalConfig.split(/\r?\n/);
  lines = lines.filter(
    (line) => !line.startsWith("//registry.npmjs.org/:_authToken="),
  );
  lines.push(`//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`);

  files.writeFileSync(path, lines.join(EOL));

  return originalConfig;
};

const revertNpmrc = (originalContent: string) => {
  log.success(`Reverting .npmrc...`);
  const files = getFiles();
  const path = getNpmrcPath();
  files.writeFileSync(path, originalContent);
};

const handler = commandHandler<
  CliOptions & {
    pkgNames: string[];
    setVersion: string;
    access: "public" | "restricted";
    tag: string;
    otp: string;
  }
>((args) => {
  const all = Package.loadAll();

  let originalConfig: string = undefined as any;
  try {
    originalConfig = setNpmRegistryCredentials();

    args.pkgNames.forEach((pkgName) => {
      const pkg = all.find(
        (pkg) => pkg.packageJson && pkg.packageJson.name === pkgName,
      );

      if (!pkg) {
        throw new CliError(
          `Package "${pkgName}" was not found. The value must match the "name" property in package.json.`,
        );
      }

      if (!existsSync(join(pkg.path, "lib"))) {
        throw new CliError(
          `./lib folder for package ${pkgName} not found. Package must be built before releasing.`,
        );
      }

      log.success(`Setting version to ${args.setVersion}...`);
      pkg.version = args.setVersion;
      pkg.saveChanges();

      log.success(`Publishing ${pkg.name}@${args.setVersion} to npm...`);
      const publishCommand =
        `npm publish ${pkg.path}` +
        (args.access ? ` --access ${args.access}` : "") +
        (args.tag ? ` --tag ${args.tag}` : "") +
        (args.otp ? ` --otp ${args.otp}` : "");
      log.info(publishCommand);
      execSync(publishCommand, { stdio: "inherit" });

      log.success("Publish complete.");
    });
  } finally {
    revertNpmrc(originalConfig);
  }
});

export const publish = {
  command: "publish <pkg-names..>",
  describe:
    "Publish the packages to npm with the specified version. This command is typically used from a CI server.",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 publish --ver <version> [options] <pkg-names..>")
      .positional("pkg-names", {
        desc:
          "Names of the packages to publish. Name must match what is in package.json.",
        type: "string",
      })
      .options({
        "set-version": {
          alias: ["ver"],
          string: true,
          default: "",
          describe: "Version to assign to the packages when publishing.",
          demand: true,
        },
        access: { string: true, describe: "Passed directly to `npm publish`" },
        tag: { string: true, describe: "Passed directly to `npm publish`" },
        otp: { string: true, describe: "Passed directly to `npm publish`" },
        ...cliOptions,
      }),

  handler,
};
