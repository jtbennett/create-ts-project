import { execSync } from "child_process";
import { existsSync, readdirSync, lstatSync } from "fs-extra";
import { join } from "path";
import * as semver from "semver";
import * as validateNpmPackageName from "validate-npm-package-name";

import {
  CliError,
  CliOptions,
  getFiles,
  PackageJson,
  log,
  logAndExit,
} from "@jtbennett/ts-project-cli-utils";

/**
 * This function was derived from create-react-app.
 * See license in this repo at ./docs/licenses.md.
 */
const checkYarnVersion = () => {
  const minYarn = "1.12.0";
  const maxYarn = "2.0.0";
  let hasMinYarn = false;
  let hasMaxYarn = false;
  let version = null;
  try {
    version = execSync("yarnpkg --version").toString().trim();
    if (semver.valid(version)) {
      hasMinYarn = semver.gte(version, minYarn);
      hasMaxYarn = semver.lt(version, maxYarn);
    } else {
      // Handle non-semver compliant yarn version strings, which yarn currently
      // uses for nightly builds. The regex truncates anything after the first
      // dash. See #5362.
      const trimmedYarnVersionMatch = /^(.+?)[-+].+$/.exec(version);
      if (trimmedYarnVersionMatch) {
        const trimmedYarnVersion = trimmedYarnVersionMatch.pop()!;
        hasMinYarn = semver.gte(trimmedYarnVersion, minYarn);
        hasMaxYarn = semver.lt(trimmedYarnVersion, maxYarn);
      }
    }
  } catch (err) {
    // ignore
  }

  if (!hasMinYarn || !hasMaxYarn) {
    throw new CliError(
      `Create Typescript Project requires yarn version 1.12+ or 2.x. ` +
        `You are running version ${version}`,
    );
  }
};

const checkNodeVersion = () => {
  if (!semver.satisfies(process.version, ">=12.0.0")) {
    throw new CliError(
      `Create Typescript Project requires node version 12.0 or greater. ` +
        `You are running version ${process.version}`,
    );
  }
};

const checkProjectName = (projectName: string) => {
  const result = validateNpmPackageName(projectName);
  if (!result.validForNewPackages) {
    throw new CliError(
      `The project name "${projectName}" must be a valid npm package name, like "my-project".`,
    );
  }
};

/**
 * This function was derived from create-react-app.
 * See license in this repo at ./docs/licenses.md.
 */
const isSafeToCreateProjectIn = (projectPath: string) => {
  const validFiles = [
    ".DS_Store",
    ".git",
    ".gitattributes",
    ".gitignore",
    ".hg",
    ".hgcheck",
    ".hgignore",
    ".npmignore",
    "docs",
    "LICENSE",
    "README.md",
    "mkdocs.yml",
    "Thumbs.db",
  ];

  // These files should be allowed to remain on a failed install, but then
  // silently removed during the next create.
  const errorLogFilePatterns = [
    "npm-debug.log",
    "yarn-error.log",
    "yarn-debug.log",
  ];
  const isErrorLog = (file: string) => {
    return errorLogFilePatterns.some((pattern) => file.startsWith(pattern));
  };

  const conflicts = readdirSync(projectPath)
    .filter((file) => !validFiles.includes(file))
    // Don't treat log files from previous installation as conflicts
    .filter((file) => !isErrorLog(file));

  if (conflicts.length > 0) {
    log.error(
      `The directory ${projectPath} contains files that could conflict:`,
    );

    for (const file of conflicts) {
      try {
        const stats = lstatSync(join(projectPath, file));
        log.info(`  ${file}${stats.isDirectory() ? "/" : ""}`);
      } catch (e) {
        log.info(`  ${file}`);
      }
    }
    logAndExit(
      new CliError(
        "Either try using a new directory name, or remove the files listed above.",
      ),
    );
  }

  // Remove any log files from a previous installation.
  readdirSync(projectPath).forEach((file) => {
    if (isErrorLog(file)) {
      getFiles().removeSync(join(projectPath, file));
    }
  });
};

const ensureProjectDir = (projectPath: string) => {
  if (existsSync(projectPath)) {
    isSafeToCreateProjectIn(projectPath);
  } else {
    getFiles().mkdirSync(projectPath);
  }
};

const copyTemplateToProjectDir = (
  templatePath: string,
  projectPath: string,
) => {
  const files = getFiles();
  files.throwIfMissing(templatePath, "Template directory could not be found.");
  files.copySync(templatePath, projectPath, {
    overwrite: false,
    errorOnExist: false,
  });
};

const updateRootPackageJson = (projectPath: string, projectName: string) => {
  const files = getFiles();
  const templateVersion = files.readJsonSync<PackageJson>(
    join(__dirname, "..", "package.json"),
  ).version;

  const projectPackageJson = files.readJsonSync<PackageJson>(
    join(projectPath, "package.json"),
  );
  projectPackageJson.name = projectName;
  projectPackageJson.devDependencies[
    "@jtbennett/ts-project-scripts"
  ] = `^${templateVersion}`;
  files.writeJsonSync(join(projectPath, "package.json"), projectPackageJson);
};

const runYarnInstall = (dryRun: boolean) => {
  if (dryRun) {
    log.info('[DRYRUN] Running "yarn install".');
  } else {
    log.info('Running "yarn install".');
    execSync("yarnpkg install", { stdio: "inherit" });
  }
};

const printInstructions = () => {
  //
};

export const createTsProject = (args: CliOptions & { projectName: string }) => {
  checkNodeVersion();
  checkYarnVersion();
  checkProjectName(args.projectName);

  const projectPath = join(process.cwd(), args.projectName);
  const templatePath = join(__dirname, "..", "template");

  ensureProjectDir(projectPath);
  copyTemplateToProjectDir(templatePath, projectPath);
  updateRootPackageJson(
    args.dryRun ? templatePath : projectPath,
    args.projectName,
  );

  runYarnInstall(!!args.dryRun);

  printInstructions();
};
