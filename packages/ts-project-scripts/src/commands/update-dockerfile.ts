import { Argv } from "yargs";
import { readFileSync, writeFileSync } from "fs-extra";
import { join } from "path";
import { EOL } from "os";

import { Package } from "../Package";
import { getPaths } from "../paths";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { tspHandler } from "../tspHandler";
import { cliOptions, log, CliError } from "@jtbennett/ts-project-cli-utils";

const handler = tspHandler<TspScriptsOptions>((args) => {
  args.yarn = false;

  const allPackages = Package.loadAll();
  const packagesToDeploy = Package.loadAll().filter(
    (pkg) => pkg.packageJson.tspConfig?.deploy === true,
  );

  if (packagesToDeploy.length === 0) {
    log.warn(
      "No packages to deploy. " +
        "Set tspConfig.deploy to true in package.json to enable deployment in dockerfile.",
    );
    return;
  }

  const paths = getPaths();
  const dockerfilePath = join(paths.rootPath, "Dockerfile");

  log.info("Updating Dockerfile...");

  const dockerfile = readFileSync(dockerfilePath, "utf-8");
  const lines = dockerfile.split(/\r?\n/);

  // Add COPY for package.json of all packages.
  const packageJsonInsertIndex = lines.findIndex((line) =>
    line.includes("@tsp-packages-copy-package-json"),
  );
  if (packageJsonInsertIndex < 0) {
    throw new CliError(
      'Could not find a comment containing "@tsp-packages-copy-package-json" in the dockerfile.',
    );
  }
  let linesToAdd = allPackages.map(
    (pkg) => `COPY packages/${pkg.dir}/package.json packages/${pkg.dir}/`,
  );
  lines.splice(packageJsonInsertIndex + 1, 0, ...linesToAdd);

  // Add COPY of bundled output for packages with tspConfig.deploy: true.
  const copyInsertIndex = lines.findIndex((line) =>
    line.includes("@tsp-packages-deploy"),
  );
  if (copyInsertIndex < 0) {
    throw new CliError(
      'Could not find a comment containing "@tsp-packages-deploy" in the dockerfile.',
    );
  }
  linesToAdd = packagesToDeploy.map(
    (pkg) =>
      `COPY --from=build --chown=1000:1000 /tmp/build/packages/${pkg.dir} /home/node/${pkg.dir}/`,
  );
  lines.splice(copyInsertIndex + 1, 0, ...linesToAdd);

  writeFileSync(dockerfilePath, lines.join(EOL));
});

export const dockerfile = {
  command: "dockerfile",
  describe: "Update the Dockerfile to prepare for deployment",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 dockerfile")
      .options({ ...cliOptions, ...tspScriptsOptions }),

  handler,
};
