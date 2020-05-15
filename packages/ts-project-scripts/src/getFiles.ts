import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  lstatSync,
} from "fs";
import { dirname, join, sep } from "path";
import * as rimrafWithCallback from "rimraf";
import { promisify } from "util";
import { ncp as ncpWithCallback } from "ncp";

import { log } from "./log";
import { TspError } from "./TspError";

const ncpCopyDir = promisify(ncpWithCallback);
const rimraf = promisify(rimrafWithCallback);

export interface FilesOptions {
  dryRun?: boolean;
}

export class Files {
  readonly dryRun: boolean;
  private _rootPath: string = undefined as any;
  private _packagesPath: string = undefined as any;

  constructor(options?: FilesOptions) {
    this.dryRun = !!options && !!options.dryRun;
  }

  get rootPath() {
    if (!this._rootPath) {
      let currentDir = process.cwd();
      let isProjectRoot = false;
      do {
        currentDir = dirname(currentDir);
        const yarnLockPath = join(currentDir, "yarn.lock");
        isProjectRoot = existsSync(yarnLockPath);
      } while (!isProjectRoot && currentDir.length > 1);

      if (!isProjectRoot) {
        throw new TspError(
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
      this.throwIfMissing(this._packagesPath);
      if (!existsSync(this._packagesPath)) {
        throw new TspError(
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
    return join(this.packagesPath, dirName);
  }

  getTemplatePath(relativePath: string) {
    let path: string;
    if (relativePath.includes(sep)) {
      path = join(this.rootPath, relativePath);
    } else {
      path = join(__dirname, "..", "templates", relativePath);
    }

    this.throwIfMissing(path, "Template directory could not be found.");

    return path;
  }

  copyDir(sourcePath: string, destinationPath: string) {
    this.throwIfMissing(sourcePath);
    this.throwIfExists(destinationPath);
    if (this.dryRun) {
      log.info(`[DRYRUN] Copying from: ${sourcePath} to ${destinationPath}`);
      return Promise.resolve();
    } else {
      log.info(`Copying from: ${sourcePath} to ${destinationPath}`);
      return ncpCopyDir(sourcePath, destinationPath, {
        clobber: false,
        stopOnErr: false,
      });
    }
  }

  async deleteDir(path: string) {
    if (!existsSync(path)) {
      log.warn(`Directory not deleted because it does not exist: ${path}`);
      return;
    }
    if (this.dryRun) {
      log.info(`[DRYRUN] Deleting the directory: ${path}`);
    } else {
      log.info(`Deleting the directory: ${path}`);
      await rimraf(path);
    }
  }

  loadJson<T = any>(...paths: string[]) {
    // TODO: Use jsonc-parser for tsconfig, so we preserve comments.
    const json = join(...paths);
    const contents = readFileSync(json, "utf-8");
    return JSON.parse(contents) as T;
  }

  saveJson(json: {}, ...paths: string[]) {
    // TODO: Use jsonc-parser for tsconfig, so we preserve comments.
    const packageJson = join(...paths);
    if (this.dryRun) {
      log.info(`[DRYRUN] Updating file: ${packageJson}`);
    } else {
      log.info(`Updating file: ${packageJson}`);
      writeFileSync(packageJson, JSON.stringify(json, null, 2));
    }
  }

  throwIfExists(path: string, message?: string) {
    if (existsSync(path)) {
      throw new TspError(
        (message || "The directory already exists.") + `\n\t${path}`,
      );
    }
  }

  throwIfMissing = (path: string, message?: string) => {
    if (!existsSync(path)) {
      throw new TspError(
        (message || "A required directory is missing.") + `\n\t${path}`,
      );
    }
  };
}

export let files: Files;

export const getFiles = (options?: { dryRun: boolean }) => {
  if (!files) {
    files = new Files(options);
  }

  return files;
};
