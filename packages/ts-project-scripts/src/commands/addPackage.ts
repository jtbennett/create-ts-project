import { Argv } from "yargs";

import { handlerWrapper } from "../handlerWrapper";
import { globalOptions } from "../options";
import { Package } from "../Package";

const handler = handlerWrapper<{
  pkgName: string;
  dirName?: string;
  template: string;
}>(async (args) => {
  await new Package({
    name: args.pkgName,
    template: args.template,
    dryRun: args.dryRun,
  }).create();
});

export const addPackage = {
  command: "add <pkg-name>",
  describe: "Add a package based on a template",

  builder: (yargs: Argv) =>
    yargs
      .positional("pkg-name", {
        desc: "Name of the package to add",
        type: "string",
      } as any)
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
            'By default an npm scope like "@myorg/" is removed.',
        },
        ...globalOptions,
      }),

  handler,
};
