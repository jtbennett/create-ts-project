#!/usr/bin/env node

import * as yargs from "yargs";
import { basename, dirname } from "path";

// See https://yargs.js.org/ for info on using yargs to create CLIs.
yargs
  .command({
    command: "*",
    handler: () => {
      console.log(`${basename(dirname(__dirname)).toUpperCase()}: Hello world`);
    },
  })
  .help().argv;
