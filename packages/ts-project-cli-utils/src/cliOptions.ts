import { Options } from "yargs";

export interface CliOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export const cliOptions: { [key: string]: Options } = {
  dryRun: {
    boolean: true,
    describe:
      "Display changes that would be made, but don't touch the file system.",
  },
  verbose: {
    boolean: true,
    alias: "v",
    describe: "Verbose output",
  },
};
