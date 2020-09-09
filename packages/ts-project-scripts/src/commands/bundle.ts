import { Argv } from "yargs";
import { copySync, existsSync } from "fs-extra";
import { join } from "path";
import { eachSeries } from "async";
import packlist = require("npm-packlist");

import { Package } from "../Package";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { tspHandler } from "../tspHandler";
import {
  cliOptions,
  log,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";
import { getPaths } from "../paths";

const NODE_MODULES = "node_modules";

const copyDirectoryIfExists = (src: string, dest: string) => {
  if (existsSync(src)) {
    log.verbose(`  Copying ${src} to ${dest}`);
    copySync(src, join(dest), { overwrite: false, errorOnExist: true });
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
  copyDirectoryIfExists(
    join(workspace.path, NODE_MODULES),
    join(dest, NODE_MODULES),
  );
};

const handler = tspHandler<
  TspScriptsOptions & { appName: string; outDir: string; nodeModules: boolean }
>(async (args) => {
  args.yarn = false;

  const app = Package.loadAll().find(
    (pkg) => pkg.packageJson && pkg.packageJson.name === args.appName,
  );

  if (!app) {
    throw new PackageNotFoundError(args.appName);
  }

  // Copy root node_modules.
  if (args.nodeModules) {
    copyDirectoryIfExists(
      join(getPaths().rootPath, NODE_MODULES),
      join(args.outDir, NODE_MODULES),
    );
  }

  // Copy the app's files.
  await copyWorkspaceFiles(app, join(args.outDir, app.dir));

  // Copy files from workspaces the app depends on.
  const workspacesToCopy: Map<string, Package> = new Map();
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
      join(args.outDir, NODE_MODULES, workspace.dir),
    );
  });
});

export const bundle = {
  command: "bundle <app-name>",
  describe: "Prepare an app for deployment. ",

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
        nodeModules: {
          alias: "n",
          describe: "Copy the root node_modules to --out-dir.",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
