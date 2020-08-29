import { CliError } from "./CliError";

export class PackageNotFoundError extends CliError {
  constructor(pkgName: string) {
    super(
      `Package "${pkgName}" was not found. The value must match the "name" property in package.json.`,
    );
  }
}
