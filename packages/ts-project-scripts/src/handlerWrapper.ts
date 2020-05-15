import { GlobalOptions } from "./options";
import { log, logAndExit } from "./log";
import { getFiles } from "./getFiles";

export const handlerWrapper = <TArgs extends {}>(
  commandFunc: (args: GlobalOptions & TArgs) => any,
) => (args: GlobalOptions & TArgs) => {
  if (args.verbose) {
    log.verbose(`cwd: ${process.cwd()}`);
    log.verbose(`args: ${JSON.stringify(args)}`);
  }

  try {
    getFiles({ dryRun: args.dryRun });

    return commandFunc(args);

    // run yarn
  } catch (err) {
    logAndExit(err, err.name === new TypeError("").name);
  }
};
