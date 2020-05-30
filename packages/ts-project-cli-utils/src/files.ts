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
  readdirSync,
  lstatSync,
} from "fs-extra";
import { join } from "path";

import { log } from "./log";
import { CliError } from "./CliError";

export class Files {
  mkdirSync(path: string) {
    mkdirSync(path);
  }

  copySync(
    src: string,
    dest: string,
    options: CopyOptionsSync & { renameTspFiles?: boolean } = {},
  ) {
    const { renameTspFiles, ...copyOptions } = {
      overwrite: false,
      errorOnExist: true,
      renameTspFiles: true,
      ...options,
    };

    this.throwIfMissing(src);

    if (options.errorOnExist) {
      this.throwIfExists(dest);
    }

    log.info(`Copying from: ${src} to ${dest}`);
    copySync(src, dest, copyOptions);

    if (renameTspFiles !== false) {
      this.renameTspFilesSync(dest);
    }
  }

  renameTspFilesSync(path: string) {
    const files = readdirSync(path);

    files.forEach((name) => {
      const filePath = join(path, name);

      if (lstatSync(filePath).isDirectory()) {
        this.renameTspFilesSync(filePath);
      }

      if (name.startsWith("_tsp_")) {
        const dest = join(path, name.substr("_tsp_".length));
        this.moveSync(filePath, dest);
      }
    });
  }

  moveSync(
    src: string,
    dest: string,
    options: MoveOptions = { overwrite: false },
  ) {
    log.info(`Moving "${src}" to "${dest}"`);
    moveSync(src, dest, options);
  }

  removeSync(path: string) {
    if (!existsSync(path)) {
      log.warn(`Directory not deleted because it does not exist: ${path}`);
      return;
    }
    log.info(`Deleting the directory: ${path}`);
    removeSync(path);
  }

  readJsonSync<T = any>(path: string) {
    // TODO: Use jsonc-parser for tsconfig, so we preserve comments.
    const contents = readFileSync(path, "utf-8");
    return JSON.parse(contents) as T;
  }

  writeJsonSync(path: string, json: {}) {
    // TODO: Use jsonc-parser for tsconfig, so we preserve comments.
    this.writeFileSync(path, JSON.stringify(json, null, 2));
  }

  writeFileSync(path: string, value: string) {
    log.info(`Updating file: ${path}`);
    writeFileSync(path, value);
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

export const getFiles = () => {
  if (!files) {
    files = new Files();
  }

  return files;
};
