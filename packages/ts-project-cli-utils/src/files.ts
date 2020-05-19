import {
  copySync,
  CopyOptionsSync,
  existsSync,
  mkdirSync,
  readFileSync,
  removeSync,
  writeFileSync,
  moveSync,
  MoveOptions,
} from "fs-extra";

import { log } from "./log";
import { CliError } from "./CliError";

export interface FilesOptions {
  dryRun?: boolean;
}

export class Files {
  readonly dryRun: boolean;

  constructor(options?: FilesOptions) {
    this.dryRun = !!options && !!options.dryRun;
  }

  mkdirSync(path: string) {
    if (this.dryRun) {
      log.info(`[DRYRUN] Creating directory: ${path}`);
    } else {
      mkdirSync(path);
    }
  }

  copySync(
    src: string,
    dest: string,
    options: CopyOptionsSync = { overwrite: false, errorOnExist: true },
  ) {
    this.throwIfMissing(src);
    if (options.errorOnExist) {
      this.throwIfExists(dest);
    }
    if (this.dryRun) {
      log.info(`[DRYRUN] Copying from: ${src} to ${dest}`);
    } else {
      log.info(`Copying from: ${src} to ${dest}`);
      return copySync(src, dest, options);
    }
  }

  moveSync(
    src: string,
    dest: string,
    options: MoveOptions = { overwrite: false },
  ) {
    if (this.dryRun) {
      log.info(`[DRYRUN] Moving "${src}" to "${dest}"`);
    } else {
      log.info(`Moving "${src}" to "${dest}"`);
      moveSync(src, dest, options);
    }
  }

  removeSync(path: string) {
    if (!existsSync(path)) {
      log.warn(`Directory not deleted because it does not exist: ${path}`);
      return;
    }
    if (this.dryRun) {
      log.info(`[DRYRUN] Deleting the directory: ${path}`);
    } else {
      log.info(`Deleting the directory: ${path}`);
      removeSync(path);
    }
  }

  readJsonSync<T = any>(path: string) {
    // TODO: Use jsonc-parser for tsconfig, so we preserve comments.
    const contents = readFileSync(path, "utf-8");
    return JSON.parse(contents) as T;
  }

  writeJsonSync(path: string, json: {}) {
    // TODO: Use jsonc-parser for tsconfig, so we preserve comments.
    if (this.dryRun) {
      log.info(`[DRYRUN] Updating file: ${path}`);
    } else {
      log.info(`Updating file: ${path}`);
      writeFileSync(path, JSON.stringify(json, null, 2));
    }
  }

  throwIfExists(path: string, message?: string) {
    if (existsSync(path)) {
      throw new CliError(
        (message || "The directory already exists.") + `\n\t${path}`,
      );
    }
  }

  throwIfMissing = (path: string, message?: string) => {
    if (!existsSync(path)) {
      throw new CliError(
        (message || "A required directory is missing.") + `\n\t${path}`,
      );
    }
  };
}

let files: Files;

export const configureFiles = (options?: { dryRun: boolean }) => {
  if (!files) {
    files = new Files(options);
  }

  return files;
};

export const getFiles = () => {
  if (!files) {
    throw new CliError("configureFiles() must be called before getFiles().");
  }

  return files;
};
