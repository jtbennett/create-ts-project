import { Argv } from "yargs";

import { cliOptions, log } from "@jtbennett/ts-project-cli-utils";

import { tspHandler } from "../tspHandler";
import { TspScriptsOptions, tspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { basename } from "path";

const handler = tspHandler<
  TspScriptsOptions & {
    from: string;
    to: string;
  }
>((args) => {
  args.yarn = false;

  const all = Package.loadAll();

  all.forEach((pkg) => {
    const refs = all.filter((p) =>
      pkg.tsconfig?.references.find((r) => basename(r.path) === p.dir),
    );

    log.success(`\n${pkg.name}`);
    refs.forEach((r) => {
      const dep = pkg.packageJson?.dependencies[r.name];
      const watch = pkg.packageJson?.nodemonConfig?.watch.find((path) =>
        path.includes(`/${r.dir}/`),
      );

      log.info(`  -> ${r.name}`);
      log.info(`      dependency version: ${dep}`);
      if (pkg.packageJson && pkg.packageJson.nodemonConfig) {
        log.info(`      nodemon watch: ${watch}`);
      }
    });
  });
});

export const list = {
  command: "list",
  describe: "List all packages and their references",

  builder: (yargs: Argv) =>
    yargs.usage("Usage: $0 list").options({
      ...cliOptions,
      ...tspScriptsOptions,
    }),

  handler,
};
