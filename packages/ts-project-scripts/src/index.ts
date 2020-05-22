#!/usr/bin/env node

import * as yargs from "yargs";

import {
  configureFiles,
  CliOptions,
  log,
  setVerbose,
} from "@jtbennett/ts-project-cli-utils";

import { addPackage } from "./commands/addPackage";
import { addReference } from "./commands/addReference";
import { removeReference } from "./commands/removeReference";
import { releasePackages } from "./commands/releasePackages";

(yargs as yargs.Argv<CliOptions>)
  .version(false)
  .scriptName("tsp")
  .usage("Usage: $0 <command> [options]")

  .middleware((argv) => {
    setVerbose(!!argv.verbose);
    if (argv.verbose) {
      log.success("Verbose logging enabled.");
    }

    configureFiles({ dryRun: !!argv.dryRun });
    if (argv.dryRun) {
      log.success(
        "This is a dry run. No files will be created, modified or deleted.",
      );
    }
  })

  .command(addPackage as any)
  .command(addReference as any)
  .command(removeReference as any)

  .command(releasePackages as any)

  .demandCommand(1, "You must enter a command.")
  .help()
  .epilog(
    "More information available at:\nhttps://github.com/jtbennett/create-ts-project",
  )
  .wrap(Math.min(90, yargs.terminalWidth())).argv;
