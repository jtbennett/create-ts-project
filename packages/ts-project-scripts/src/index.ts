#!/usr/bin/env node

import * as yargs from "yargs";

import { CliOptions, log, setVerbose } from "@jtbennett/ts-project-cli-utils";

import { list } from "./commands/list";
import { create } from "./commands/create";
import { rename } from "./commands/rename";
import { add } from "./commands/add";
import { remove } from "./commands/remove";

import { bundle } from "./commands/bundle";

(yargs as yargs.Argv<CliOptions>)
  .version(false)
  .scriptName("tsp")
  .usage("Usage: $0 <command> [options] [--help]")

  .middleware((argv) => {
    setVerbose(!!argv.verbose);
    if (argv.verbose) {
      log.success("Verbose logging enabled.");
    }
  })

  .command(list as any)
  .command(create as any)
  .command(rename as any)
  .command(add as any)
  .command(remove as any)
  .command(bundle as any)

  .demandCommand(1, "You must enter a command.")
  .help()
  .epilog(
    "More information available at:\nhttps://github.com/jtbennett/create-ts-project",
  )
  .wrap(Math.min(120, yargs.terminalWidth())).argv;
