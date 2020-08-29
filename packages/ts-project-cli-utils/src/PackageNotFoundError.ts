import { CliError } from "./CliError";

export class PackageNotFoundError extends CliError {
  constructor(pkgNameOrPath: string) {
    super(
      `Package "${pkgNameOrPath}" was not found. ` +
        `When specifying a name, it must match the "name" property in package.json.`,
    );
  }
}
