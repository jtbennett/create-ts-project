import { existsSync, readdirSync, lstatSync } from "fs-extra";
import { dirname, join, sep, resolve } from "path";

import { CliError, getFiles, Files } from "@jtbennett/ts-project-cli-utils";

export class Paths {
  files: Files;
  private _rootPath: string = undefined as any;
  private _packagesPath: string = undefined as any;

  constructor() {
    this.files = getFiles();
  }

  get rootPath() {
    if (!this._rootPath) {
      let currentDir = process.cwd();
      let isProjectRoot = false;
      do {
        const yarnLockPath = join(currentDir, "yarn.lock");
        isProjectRoot = existsSync(yarnLockPath);
        if (!isProjectRoot) {
          currentDir = dirname(currentDir);
        }
      } while (!isProjectRoot && currentDir.length > 1);

      if (!isProjectRoot) {
        throw new CliError(
          "Could not find a yarn.lock file to mark the project root.",
        );
      }

      this._rootPath = currentDir;
    }

    return this._rootPath;
  }

  get packagesPath() {
    if (!this._packagesPath) {
      this._packagesPath = join(this.rootPath, "packages");
      this.files.throwIfMissing(this._packagesPath);
      if (!existsSync(this._packagesPath)) {
        throw new CliError(
          `Could not find the "packages" directory in the project root.\n\t${this._packagesPath}`,
        );
      }
    }
    return this._packagesPath;
  }

  getAllPackagePaths() {
    return readdirSync(this.packagesPath)
      .map((p) => join(this.packagesPath, p))
      .filter((p) => lstatSync(p).isDirectory());
  }

  getPackagePath(dirName: string) {
    return resolve(this.packagesPath, dirName);
  }

  getTemplatePath(relativePath: string) {
    let path: string;
    if (relativePath.includes(sep)) {
      path = resolve(this.rootPath, relativePath);
    } else {
      path = join(__dirname, "..", "templates", relativePath);
    }

    this.files.throwIfMissing(path, "Template directory could not be found.");

    return path;
  }
}

let paths: Paths;

export const getPaths = () => {
  if (!paths) {
    paths = new Paths();
  }

  return paths;
};
