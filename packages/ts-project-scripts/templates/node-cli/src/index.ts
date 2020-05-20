#!/usr/bin/env node

import * as yargs from "yargs";

yargs
  .command({
    command: "*",
    handler: () => {
      console.log("Hello world", new Date());
    },
  })
  .help().argv;
