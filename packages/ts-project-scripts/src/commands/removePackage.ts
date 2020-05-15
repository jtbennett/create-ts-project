import { Argv } from "yargs";

import { handlerWrapper } from "../handlerWrapper";
import { globalOptions } from "../options";
import { Package } from "../Package";

const handler = handlerWrapper<{
  pkgName: string;
  force?: boolean;
}>(async (args) => {
  await new Package({ name: args.pkgName, dryRun: !!args.dryRun }).delete(
    !!args.force,
  );
});

export const removePackage = {
  command: "remove <pkg-name>",
  describe: "Remove a package",

  builder: (yargs: Argv) =>
    yargs
      .positional("pkg-name", {
        desc: "Name of the package to remove.",
        type: "string",
      } as any)
      .options({
        force: {
          boolean: true,
          describe:
            "Allow removal when references to the package exist. References will also be removed.",
        },
        ...globalOptions,
      }),

  handler,
};
