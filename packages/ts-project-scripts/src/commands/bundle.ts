import { Argv } from "yargs";
import { unlinkSync, copySync, existsSync } from "fs-extra";
import { join, normalize } from "path";
import { eachSeries } from "async";
import packlist = require("npm-packlist");

import { Package } from "../Package";
import { getPaths } from "../paths";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { tspHandler } from "../tspHandler";
import {
  cliOptions,
  log,
  PackageNotFoundError,
} from "@jtbennett/ts-project-cli-utils";

const NODE_MODULES = "node_modules";

const copyWorkspaceFiles = async (workspace: Package) => {
  const paths = getPaths();
  const dest = join(paths.rootPath, NODE_MODULES, normalize(workspace.name));

  log.info(`Copying ${workspace.name} to ${dest}`);

  // Currently, dest is a symlink created by yarn. Unlink it.
  if (existsSync(dest)) {
    unlinkSync(dest);
  }

  // Copy the files that would be included if the package were published.
  const filesToCopy = await packlist({ path: workspace.path });
  filesToCopy.forEach((file) => {
    log.verbose(`  Copying ${file}`);
    copySync(join(workspace.path, file), join(dest, file));
  });

  // Copy node_modules, which will contain only the dependencies for which
  // this workspace requires a different version than another workspace.
  const nodeModules = join(workspace.path, NODE_MODULES);
  if (existsSync(nodeModules)) {
    log.verbose(`  Copying ${NODE_MODULES}`);
    copySync(nodeModules, join(dest, NODE_MODULES), {
      overwrite: false,
      errorOnExist: true,
    });
  }
};

const handler = tspHandler<TspScriptsOptions & { appName: string }>(
  async (args) => {
    args.yarn = false;

    const app = Package.loadAll().find(
      (pkg) => pkg.packageJson && pkg.packageJson.name === args.appName,
    );

    if (!app) {
      throw new PackageNotFoundError(args.appName);
    }

    const workspacesToCopy: Map<string, Package> = new Map();
    const addWorkspacesToCopy = (pkg: Package) => {
      if (workspacesToCopy.has(pkg.name)) {
        return;
      }

      pkg.loadDependencies().forEach((dep) => {
        workspacesToCopy.set(dep.name, dep);
        addWorkspacesToCopy(dep);
      });
    };

    log.success(`Copying workspaces used by "${app.name}"...`);
    addWorkspacesToCopy(app);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await eachSeries(workspacesToCopy.values(), async (workspace) => {
      await copyWorkspaceFiles(workspace);
    });
  },
);

export const bundle = {
  command: "bundle <app-name>",
  describe:
    "Pack and copy workspaces used by an app into the root node_modules. ",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 bundle <app-name>")
      .positional("app-name", {
        desc: "Name of the app to bundle.",
        type: "string",
      })
      .options({ ...cliOptions, ...tspScriptsOptions }),

  handler,
};
