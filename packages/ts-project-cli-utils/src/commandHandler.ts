import { CliError } from "./CliError";
import { CliOptions } from "./cliOptions";
import { log, logAndExit } from "./log";
import { Arguments } from "yargs";

export const commandHandler = <TArgs extends CliOptions>(
  commandFunc: (args: Arguments<TArgs>) => any,
) => (args: Arguments<TArgs>) => {
  if (args.verbose) {
    log.verbose(`cwd: ${process.cwd()}`);
    log.verbose(`args: ${JSON.stringify(args)}`);
  }

  try {
    return commandFunc(args);
  } catch (err) {
    logAndExit(err, err.name === new CliError("").name);
  }
};
