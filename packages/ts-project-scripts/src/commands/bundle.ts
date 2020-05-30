import { Argv } from "yargs";
import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  unlinkSync,
  copySync,
  readdirSync,
  existsSync,
  readJsonSync,
} from "fs-extra";
import { join, dirname } from "path";
import { eachSeries } from "async";
import * as resolve from "resolve";
import packlist = require("npm-packlist");

import { Package } from "../Package";
import { getPaths } from "../paths";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { tspHandler } from "../tspHandler";
import { cliOptions, log } from "@jtbennett/ts-project-cli-utils";

const PACKAGE_JSON = "package.json";
const NODE_MODULES = "node_modules";

const copyReferencedPackages = async (mainPkg: Package) => {
  const getAppDependencyVersion = (name: string) => {
    let path = "";
    try {
      path = resolve.sync(name, {
        basedir: mainPkg.path,
        preserveSymlinks: false,
      });
    } catch {
      // app doesn't have the module at all.
      return "";
    }

    // resolve() gives us the main .js file. Get the package file.
    let packageFile = join(dirname(path), PACKAGE_JSON);
    while (
      packageFile.length > PACKAGE_JSON.length + 1 &&
      !existsSync(packageFile)
    ) {
      packageFile = join(dirname(packageFile), "..", PACKAGE_JSON);
    }

    if (existsSync(packageFile)) {
      const appDep = readJsonSync(packageFile);
      return appDep.version;
    }

    return "";
  };

  const references = mainPkg.loadReferences();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  await eachSeries(references, async (ref) => {
    log.info(`  ${ref.name}`);

    const dest = join(mainPkg.path, NODE_MODULES, ref.name);

    // Currently, the dest is a link created by yarn. Unlink it.
    if (existsSync(dest)) {
      unlinkSync(dest);
    }

    // Copy the files that would be included if the package were published.
    const filesToCopy = await packlist({ path: ref.path });
    filesToCopy.forEach((file) => {
      log.verbose(`    Copying ${file}`);
      copySync(join(ref.path, file), join(dest, file));
    });

    // Copy the ref dependency if the app doesn't have it or has a different version.
    const copyRefDependencyIfNeeded = (name: string) => {
      const appVersion = getAppDependencyVersion(name);
      const refDep = readJsonSync(
        join(ref.path, NODE_MODULES, name, PACKAGE_JSON),
      );

      if (refDep.version !== appVersion) {
        log.verbose(`    Copying node_modules/${name}`);
        copySync(
          join(ref.path, NODE_MODULES, name),
          join(dest, NODE_MODULES, name),
        );
      }
    };

    readdirSync(join(ref.path, NODE_MODULES)).forEach((name) => {
      if (name === ".bin") {
        return;
      }

      // Handle scoped names like @my-org/my-package.
      if (name.startsWith("@")) {
        readdirSync(join(ref.path, NODE_MODULES, name)).forEach(
          (scopedName) => {
            copyRefDependencyIfNeeded(join(name, scopedName));
          },
        );
      } else {
        copyRefDependencyIfNeeded(name);
      }
    });
  });
};

const handler = tspHandler<
  TspScriptsOptions & { pkgName?: string; all?: boolean }
>(async (args) => {
  args.yarn = false;

  const packagesToBundle = Package.loadAll().filter((pkg) => {
    const { tspConfig } = pkg.packageJson;
    const deploy = tspConfig?.deploy === true;
    const bundle =
      tspConfig?.bundle === true || (deploy && tspConfig?.bundle !== false);
    return bundle && (!!args.all || pkg.name === args.pkgName);
  });

  if (packagesToBundle.length === 0) {
    log.warn(
      "No packages to bundle. " +
        "Set either tspConfig.bundle or tspConfig.publish to true in package.json to enable bundling.",
    );
    return;
  }

  const paths = getPaths();
  const rootPackageFilePath = join(paths.rootPath, PACKAGE_JSON);
  let originalContent = "";
  try {
    // TODO: Figure out why this line prevents a crash.
    await Promise.resolve();

    log.info("Setting nohoist in root package.json...");
    // Set nohoist for all packages.
    originalContent = readFileSync(rootPackageFilePath, "utf-8");
    const packageObj = JSON.parse(originalContent);
    packageObj.workspaces.nohoist = ["**"];
    writeFileSync(rootPackageFilePath, JSON.stringify(packageObj, null, 2));

    // With nohoist set, all dependencies will go to node_modules
    // underneath each package.
    // Remove all devDependencies with --production.
    // We expect yarn to have been previously run, so everything is cached.
    log.info("Removing devDependencies...");
    execSync("yarn --frozen-lockfile --production --offline", {
      cwd: paths.rootPath,
      stdio: "inherit",
    });

    // When our own local packages are referenced, yarn creates a symlink
    // from ./packages/[app]/node_modules/[ref] to ./packages/[ref]
    // We need to replace the link with the the actual files and
    // also copy ref's unique dependencies to
    // ./packages/[app]/node_modules/[ref]/node_modules
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await eachSeries(packagesToBundle, async (pkg) => {
      log.success(`Copying referenced packages for "${pkg.name}"...`);
      await copyReferencedPackages(pkg);
    });
  } finally {
    if (originalContent) {
      log.info("Removing nohoist in root package.json...");
      writeFileSync(rootPackageFilePath, originalContent);
    }
  }
});

export const bundle = {
  command: "bundle [pkg-name]",
  describe:
    "Prepare an app for deployment by moving refs under its node_modules. ",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 bundle [pkg-name]")
      .positional("pkg-name", {
        desc: "Name of the app to bundle.",
        type: "string",
      })
      .options({
        all: {
          boolean: true,
          describe: "Bundle all packages with tspConfig.bundle = true",
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
