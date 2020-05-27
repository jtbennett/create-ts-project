#!/usr/bin/env node

import * as yargs from "yargs";

import {
  commandHandler,
  setVerbose,
  log,
  configureFiles,
  CliOptions,
} from "@jtbennett/ts-project-cli-utils";

import { createTsProject } from "./createTsProject";

const handler = commandHandler(createTsProject);

(yargs as yargs.Argv<CliOptions & { projectName: string }>)
  .usage("Usage: $0 <project-name> [--no-yarn]")

  .middleware((argv) => {
    setVerbose(!!argv.verbose);
    if (argv.verbose) {
      log.verbose("Verbose logging enabled.");
    }

    configureFiles({ dryRun: !!argv.dryRun });
    if (argv.dryRun) {
      log.success(
        "This is a dry run. No files will be created, modified or deleted.",
      );
    }
  })

  .command({
    command: "* <project-name>",
    describe: "Create a new TypeScript project.",
    builder: (yargs) =>
      yargs
        .positional("project-name", {
          desc:
            "Name of the project. A folder will be created with this name. " +
            "May also be an absolute or relative path (relative to the cwd).",
          type: "string",
        })
        .options({
          yarn: {
            boolean: true,
            describe:
              "Run yarn after the command completes. Disable with --no-yarn.",
            default: true,
          },
        }),
    handler,
  })

  .help()
  .epilog(
    "More information available at:\nhttps://github.com/jtbennett/create-ts-project",
  )
  .wrap(Math.min(90, yargs.terminalWidth())).argv;
