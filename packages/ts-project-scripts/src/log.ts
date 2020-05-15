import { gray, green, yellow, red } from "chalk";

export const log = {
  verbose: (message: string) => console.log(gray(message)),
  info: (message: string) => console.log(message),
  success: (message: string) => console.log(green(message)),
  warn: (message: string) => console.log(yellow(`WARNING: ${message}`)),
  error: (message: string) => console.log(red(`ERROR: ${message}`)),
};

export const logAndExit = (error: Error, suppressStackTrace = false) => {
  if (!suppressStackTrace) {
    console.log(error);
  }
  log.error(error.message);
  process.exit(1);
};
