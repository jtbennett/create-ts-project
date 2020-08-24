import { join, basename, resolve, dirname } from "path";
import {
  getFiles,
  CliError,
  Tsconfig,
  PackageJson,
} from "@jtbennett/ts-project-cli-utils";
import { getPaths } from "./paths";
import { readdirSync, statSync, removeSync } from "fs-extra";

const files = getFiles();
const paths = getPaths();

const TSCONFIG_BUILD_JSON = "tsconfig.build.json";
const PACKAGE_JSON = "package.json";
const tsconfigFilePattern = /^tsconfig.*\.json$/;

export class Package {
  dir: string;
  path: string;
  packageJson: PackageJson;
  tsconfigs: { [key: string]: Tsconfig } = {};
  srcDir: string;
  libDir: string;

  constructor(options: { packageJson: PackageJson; dir: string }) {
    this.packageJson = options.packageJson;
    this.dir = basename(options.dir);
    this.path = paths.getPackagePath(options.dir);
    this.srcDir = "src";
    this.libDir = "lib";

    readdirSync(this.path)
      .filter((name) => tsconfigFilePattern.exec(name))
      .forEach((name) => {
        this.tsconfigs[name] = files.readJsonSync<Tsconfig>(
          join(this.path, name),
        );
      });
  }

  static loadAll() {
    return paths.getAllPackagePaths().map((path) => Package.load(path));
  }

  static load(path: string) {
    const dir = paths.getPackagePath(path);

    const packageJson = files.readJsonSync<PackageJson>(
      join(dir, PACKAGE_JSON),
    );

    return new Package({ packageJson, dir });
  }

  static create(args: {
    name: string;
    template: string;
    dir?: string;
    renameTspFiles?: boolean;
  }) {
    const dir = args.dir || Package.removeScopeIfAny(args.name);
    const path = paths.getPackagePath(dir);

    const templatePath = paths.getTemplatePath(args.template);
    const skipFolders = [
      "build",
      "dist",
      "lib",
      "coverage",
      "node_modules",
    ].map((name) => join(templatePath, name));
    files.copySync(templatePath, path, {
      renameTspFiles: args.renameTspFiles !== false,
      filter: (src: string) => !skipFolders.some((s) => src.startsWith(s)),
    });

    const packageFilePath = join(path, PACKAGE_JSON);
    const packageJson = files.readJsonSync(packageFilePath);
    packageJson.name = args.name;
    files.writeJsonSync(packageFilePath, packageJson);

    return new Package({ packageJson, dir });
  }

  get name() {
    return this.packageJson.name;
  }

  set name(value: string) {
    this.packageJson.name = value;
  }

  get version() {
    return this.packageJson.version;
  }

  set version(value: string) {
    this.packageJson.version = value;
  }

  loadReferences() {
    const keys = Object.keys(this.tsconfigs);
    this.tsconfigs[keys[0]].references =
      this.tsconfigs[keys[0]].references || [];
    const references = this.tsconfigs[keys[0]].references;
    return references.map((ref) => {
      let path = resolve(this.path, ref.path);
      path = statSync(path).isFile() ? dirname(path) : path;
      return Package.load(path);
    });
  }

  addReferenceTo(dependency: Package) {
    for (const key in this.tsconfigs) {
      this.tsconfigs[key].references = this.tsconfigs[key].references || [];
      const references = this.tsconfigs[key].references;

      const refIndex = references.findIndex((ref) =>
        ref.path.endsWith(`/${dependency.dir}/${TSCONFIG_BUILD_JSON}`),
      );
      if (refIndex < 0) {
        references.push({
          path: `../${dependency.dir}/${TSCONFIG_BUILD_JSON}`,
        });
      }
    }

    const { dependencies } = this.packageJson;
    if (!dependencies[dependency.name]) {
      dependencies[dependency.name] = "workspace:*";
    }

    const { jest } = this.packageJson;
    if (jest) {
      jest.moduleNameMapper = jest.moduleNameMapper || {};
      if (!jest.moduleNameMapper[dependency.name]) {
        jest.moduleNameMapper[
          dependency.name
        ] = `<rootDir>/../${dependency.dir}/${this.srcDir}`;
      }
    }

    const watch = this.packageJson?.nodemonConfig?.watch;
    if (watch) {
      const index = watch.findIndex((path) =>
        path.endsWith(`/${dependency.dir}/${this.libDir}`),
      );
      if (index < 0) {
        watch.push(`../${dependency.name}/${this.libDir}`);
      }
    }

    this.saveChanges();
  }

  removeReferenceTo(dependency: Package) {
    let removed = false;

    for (const key in this.tsconfigs) {
      const { references } = this.tsconfigs[key];
      if (!references) {
        continue;
      }
      const refIndex = references.findIndex((ref) =>
        ref.path.endsWith(`/${dependency.dir}/${TSCONFIG_BUILD_JSON}`),
      );
      if (refIndex >= 0) {
        removed = true;
        references.splice(refIndex, 1);
      }
    }

    const { dependencies } = this.packageJson;
    if (dependencies[dependency.name]) {
      removed = true;
      delete dependencies[dependency.name];
    }

    const { jest } = this.packageJson;
    if (jest?.moduleNameMapper && jest.moduleNameMapper[dependency.name]) {
      removed = true;
      delete jest.moduleNameMapper[dependency.name];
    }

    const watch = this.packageJson?.nodemonConfig?.watch;
    if (watch) {
      const index = watch.findIndex((path) =>
        path.endsWith(`/${dependency.dir}/${this.libDir}`),
      );
      if (index >= 0) {
        removed = true;
        watch.splice(index, 1);
      }
    }

    if (removed) {
      this.saveChanges();
    }

    return removed;
  }

  rename(newName: string, newDir?: string) {
    const newPkg = Package.create({
      name: newName,
      template: this.path,
      dir: newDir,
      renameTspFiles: false,
    });

    Package.loadAll().forEach((pkg) => {
      const removed = pkg.removeReferenceTo(this);
      if (removed) {
        pkg.addReferenceTo(newPkg);
      }
    });

    removeSync(this.path);
  }

  saveChanges() {
    for (const key in this.tsconfigs) {
      files.writeJsonSync(join(this.path, key), this.tsconfigs[key]);
    }

    files.writeJsonSync(join(this.path, PACKAGE_JSON), this.packageJson);
  }

  private static removeScopeIfAny(name: string) {
    if (!name.startsWith("@")) {
      return name;
    }

    const delimPos = name.indexOf("/");
    if (delimPos < 2) {
      throw new CliError(
        "Scoped name starts with '@', but does not contain a '/'.",
      );
    }
    if (delimPos === name.length - 1) {
      throw new CliError("Name cannot end in '/'.");
    }

    return name.substr(delimPos + 1);
  }
}
