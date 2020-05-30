#!/usr/bin/env node

import * as yargs from "yargs";

import { CliOptions, log, setVerbose } from "@jtbennett/ts-project-cli-utils";

import { list } from "./commands/list";
import { add } from "./commands/add";
import { rename } from "./commands/rename";
import { ref } from "./commands/ref";
import { unref } from "./commands/unref";

import { publish } from "./commands/publish";
import { dockerfile } from "./commands/update-dockerfile";
import { bundle } from "./commands/bundle";

(yargs as yargs.Argv<CliOptions>)
  .version(false)
  .scriptName("tsp")
  .usage("Usage: $0 <command> [options]")

  .middleware((argv) => {
    setVerbose(!!argv.verbose);
    if (argv.verbose) {
      log.success("Verbose logging enabled.");
    }
  })

  .command(list as any)
  .command(add as any)
  .command(rename as any)
  .command(ref as any)
  .command(unref as any)

  .command(publish as any)
  .command(dockerfile as any)
  .command(bundle as any)

  .demandCommand(1, "You must enter a command.")
  .help()
  .epilog(
    "More information available at:\nhttps://github.com/jtbennett/create-ts-project",
  )
  .wrap(Math.min(90, yargs.terminalWidth())).argv;
