import { Argv } from "yargs";
import { copySync, existsSync } from "fs-extra";
import { join, normalize } from "path";
import { eachSeries } from "async";
import packlist = require("npm-packlist");

import { Package } from "../Package";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { tspHandler } from "../tspHandler";
import {
  CliError,
  cliOptions,
  log,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";
import { getPaths } from "../paths";
import { execSync } from "child_process";

const NODE_MODULES = "node_modules";

const copyNodeModules = (src: string, dest: string, skip?: Package[]) => {
  if (existsSync(src)) {
    log.verbose(`  Copying ${src} to ${dest}`);

    // Don't copy workspaces -- they're handled separately.
    const filter =
      skip && skip?.length > 0
        ? (src: string) =>
            !skip.some((pkg) =>
              src.endsWith(join(NODE_MODULES, normalize(pkg.name))),
            )
        : undefined;

    copySync(src, dest, { overwrite: false, errorOnExist: true, filter });
  } else {
    log.verbose(`  Directory to copy does not exist: "${src}"`);
  }
};

const copyWorkspaceFiles = async (workspace: Package, dest: string) => {
  log.info(`Copying ${workspace.name} to ${dest}`);

  // Copy the files that would be included if the package were published.
  const filesToCopy = await packlist({ path: workspace.path });
  filesToCopy.forEach((file) => {
    log.verbose(`  Copying ${file}`);
    copySync(join(workspace.path, file), join(dest, file));
  });

  // Copy node_modules, which will contain only the dependencies for which
  // this workspace requires a different version than another workspace.
  copyNodeModules(join(workspace.path, NODE_MODULES), join(dest, NODE_MODULES));
};

const handler = tspHandler<
  TspScriptsOptions & { appName: string; outDir: string }
>(async (args) => {
  const allPackages = Package.loadAll();
  const app = allPackages.find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.appName,
  );

  if (!app) {
    throw new PackageNotFoundError(args.appName);
  }

  if (existsSync(args.outDir)) {
    throw new CliError(`Out directory already exists: ${args.outDir}`);
  }

  // Remove all devDependencies, plus all dependencies not used by this app.
  // This has to be done inside bundle, because ts-project-scripts itself is a
  // devDependency, and will be removed by this command.
  if (args.yarn) {
    log.info(
      `Removing dependencies not used by ${args.appName} and all devDependencies.`,
    );
    execSync(`yarn workspaces focus --production ${args.appName}`, {
      stdio: "inherit",
    });
  } else {
    log.warn(
      "Yarn was not run. node_modules in --out-dir may be missing required dependencies and/or " +
        "include devDependencies or other unnecessary dependencies.",
    );
  }

  // Copy root node_modules, excluding workspace symlinks.
  copyNodeModules(
    join(getPaths().rootPath, NODE_MODULES),
    join(args.outDir, NODE_MODULES),
    allPackages,
  );

  // Copy the app's files.
  await copyWorkspaceFiles(app, join(args.outDir, app.dir));

  // Copy files from workspaces the app depends on.
  const workspacesToCopy = new Map<string, Package>();
  const addWorkspacesToCopy = (pkg: Package) => {
    if (!workspacesToCopy.has(pkg.name)) {
      pkg.loadDependencies().forEach((dep) => {
        workspacesToCopy.set(dep.name, dep);
        addWorkspacesToCopy(dep);
      });
    }
  };
  addWorkspacesToCopy(app);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  await eachSeries(workspacesToCopy.values(), async (workspace) => {
    await copyWorkspaceFiles(
      workspace,
      join(args.outDir, NODE_MODULES, normalize(workspace.name)),
    );
  });

  // Don't rerun yarn on CI server.
  args.yarn = args.yarn && process.env.CI !== "true";
});

export const bundle = {
  command: "bundle <app-name>",
  describe: "Prepare an app for deployment",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 bundle <app-name> --out-dir <out-dir>")
      .positional("app-name", {
        desc: "Name of the app to bundle.",
        type: "string",
      })
      .options({
        outDir: {
          alias: "o",
          describe: "Path where the bundled application will be output.",
          demand: true,
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
