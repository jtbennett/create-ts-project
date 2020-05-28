import { Options } from "yargs";

export interface CliOptions {
  verbose?: boolean;
}

export const cliOptions: { [key: string]: Options } = {
  verbose: {
    boolean: true,
    alias: "v",
    describe: "Verbose output",
  },
};
