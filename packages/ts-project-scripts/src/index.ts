#!/usr/bin/env node
import * as yargs from "yargs";

import { addPackage } from "./commands/addPackage";
import { removePackage } from "./commands/removePackage";
import { addReference } from "./commands/addReference";
import { removeReference } from "./commands/removeReference";

yargs
  .usage("Usage: $0 <command> [options]")
  .command(addPackage)
  .command(removePackage)
  .command(addReference)
  .command(removeReference)
  .demandCommand(1, "You must enter a command.")
  .help().argv;
