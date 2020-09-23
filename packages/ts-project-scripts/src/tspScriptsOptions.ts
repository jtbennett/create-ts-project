import { Options } from "yargs";

import { CliOptions } from "@jtbennett/ts-project-cli-utils";

export interface TspScriptsOptions extends CliOptions {
  yarn: boolean;
}

export const tspScriptsOptions: { [key: string]: Options } = {
  yarn: {
    boolean: true,
    describe: "Run yarn after the command completes. Disable with --no-yarn.",
    default: true,
  },
};
