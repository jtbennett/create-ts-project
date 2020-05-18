import { Options } from "yargs";

import { CliOptions } from "@jtbennett/ts-project-cli-utils";

export interface TspScriptsOptions extends CliOptions {
  "no-yarn": boolean;
  "no-prettier": boolean;
}

export const tspScriptsOptions: { [key: string]: Options } = {
  "no-yarn": {
    boolean: true,
    describe: "Don't run yarn after the command completes.",
  },
  "no-prettier": {
    boolean: true,
    describe: "Don't run prettier on new or modified files",
  },
};
