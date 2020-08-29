import { Argv } from "yargs";

import { cliOptions, log } from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { basename, dirname } from "path";

const handler = tspHandler<
  TspScriptsOptions & {
    from: string;
    to: string;
  }
>((args) => {
  args.yarn = false;

  const all = Package.loadAll();

  all.forEach((pkg) => {
    const keys = Object.keys(pkg.tsconfigs);
    const refs = all.filter((p) => {
      return pkg.tsconfigs[keys[0]].references.find((r) => {
        return basename(dirname(r.path)) === p.dir;
      });
    });

    log.success(`\n${pkg.name}`);
    refs.forEach((r) => {
      const dep = pkg.packageJson?.dependencies[r.name];
      log.info(`  -> ${r.name}@${dep}`);
    });
  });
});

export const list = {
  command: "list",
  describe: "List all packages and their references within the project",

  builder: (yargs: Argv) =>
    yargs.usage("Usage: $0 list").options({
      ...cliOptions,
      ...tspScriptsOptions,
    }),

  handler,
};
