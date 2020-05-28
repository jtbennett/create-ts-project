import { Argv } from "yargs";

import { cliOptions } from "@jtbennett/ts-project-cli-utils";

import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { tspHandler } from "../tspHandler";
import { addCreateReactApp } from "./add-create-react-app";

const handler = tspHandler<
  TspScriptsOptions & {
    pkgName: string;
    dir?: string;
    template: string;
  }
>((args) => {
  switch (args.template) {
    case "create-react-app":
      addCreateReactApp(args);
      break;

    default:
      Package.create({
        name: args.pkgName,
        dir: args.dir,
        template: args.template,
      });
  }
});

export const add = {
  command: "add <pkg-name>",
  describe: "Add a package based on a template",

  builder: (yargs: Argv) =>
    yargs
      .usage("Usage: $0 add <pkg-name> -t <template>")

      .positional("pkg-name", {
        desc:
          "Name of the package to add. Name will be written to package.json.",
        type: "string",
      })
      .options({
        template: {
          alias: "t",
          describe:
            "Name or path of the template to use. Path is relative to project root.",
          demand: true,
        },
        dir: {
          alias: "d",
          describe:
            "Name of the directory, if different from the package name. " +
            'By default an npm scope like "@myorg/" is not included in the directory name.',
        },
        ...cliOptions,
        ...tspScriptsOptions,
      }),

  handler,
};
