import { Options } from "yargs";

export interface GlobalOptions {
  dryRun: boolean;
  "no-yarn": boolean;
  "no-prettier": boolean;
  verbose: boolean;
}

export const globalOptions: { [key: string]: Options } = {
  dryRun: {
    boolean: true,
    describe:
      "Display changes that would be made, but don't touch the file system.",
  },
  "no-yarn": {
    boolean: true,
    describe: "Don't run yarn after the command completes.",
  },
  "no-prettier": {
    boolean: true,
    describe: "Don't run prettier on new or modified files",
  },
  verbose: {
    boolean: true,
    alias: "v",
    describe: "Verbose output",
  },
};
