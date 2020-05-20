import { basename, join } from "path";
import {
  getFiles,
  CliError,
  Files,
  Tsconfig,
  PackageJson,
} from "@jtbennett/ts-project-cli-utils";
import { getPaths, Paths } from "./paths";

export class Package {
  paths: Paths;
  files: Files;
  name: string;
  template: string;
  dirName: string;
  dryRun: boolean;
  tsconfig?: Tsconfig;
  packageJson?: PackageJson;
  path: string;

  constructor(options: {
    name: string;
    template?: string;
    dirName?: string;
    dryRun?: boolean;
    tsconfig?: Tsconfig;
    packageJson?: PackageJson;
  }) {
    this.files = getFiles();
    this.paths = getPaths();
    this.name = options.name;
    this.template = options.template || "";
    this.dirName = options.dirName || this.getNameWithoutScope();
    this.dryRun = !!options.dryRun;
    this.tsconfig = options.tsconfig;
    this.packageJson = options.packageJson;

    this.path = this.paths.getPackagePath(this.dirName);
  }

  static loadAll() {
    return getPaths()
      .getAllPackagePaths()
      .map((path) => Package.load(path));
  }

  static load(path: string) {
    const files = getFiles();

    const tsconfig = files.readJsonSync<Tsconfig>(join(path, "tsconfig.json"));
    tsconfig.references = tsconfig.references || [];
    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};

    const packageJson = files.readJsonSync<PackageJson>(
      join(path, "package.json"),
    );
    packageJson.dependencies = packageJson.dependencies || {};

    const name = packageJson.name;
    const dirName = basename(path);

    return new Package({ name, dirName, packageJson, tsconfig });
  }

  create() {
    const templatePath = this.paths.getTemplatePath(this.template);

    this.files.copySync(templatePath, this.path);

    const path = this.files.dryRun ? templatePath : this.path;
    const name = this.files.dryRun ? "_tsp_package.json" : "package.json";

    const json = this.files.readJsonSync(join(path, name));
    json.name = this.name;
    this.files.writeJsonSync(join(path, name), json);

    this.packageJson = json;
    this.tsconfig = this.files.readJsonSync(join(path, name));
  }

  delete(force = false) {
    const details = Package.loadAll();
    const dependents = details.filter(
      (pkg) =>
        pkg.name !== this.name &&
        !!pkg.tsconfig!.references.find((ref) =>
          ref.path.endsWith(`/${this.dirName}`),
        ),
    );

    if (dependents.length > 0) {
      if (force) {
        dependents.forEach((dep) => dep.removeReferenceTo(this));
      } else {
        throw new CliError(
          `"${this.name}" is referenced by other packages. ` +
            "Use the '--force' option to remove the package and all references to it.\nReferenced by:\n\t" +
            dependents.map((r) => r.packageJson!.name).join("\n\t"),
        );
      }
    }

    this.files.removeSync(this.path);
  }

  setVersion(version: string) {
    const packageJsonPath = join(this.path, "package.json");
    const json = this.files.readJsonSync(packageJsonPath);
    json.version = version;
    this.files.writeJsonSync(packageJsonPath, json);
  }

  addReferenceTo(dependency: Package) {
    const {
      references,
      compilerOptions: { paths },
    } = this.tsconfig!;

    const refIndex = references.findIndex((ref) =>
      ref.path.endsWith(`/${dependency.dirName}`),
    );
    if (refIndex < 0) {
      references.push({ path: `../${dependency.dirName}` });
    }

    if (!paths[dependency.name]) {
      paths[dependency.name] = [`../${dependency.dirName}/src`];
    }

    const { dependencies } = this.packageJson!;
    if (!dependencies[dependency.name]) {
      dependencies[dependency.name] = "*";
    }

    const watch = this.packageJson?.nodemonConfig?.watch;
    if (watch) {
      const index = watch.findIndex((path) =>
        path.endsWith(`/${dependency.dirName}/lib`),
      );
      if (index < 0) {
        watch.push(`../${dependency.name}/lib`);
      }
    }

    this.files.writeJsonSync(join(this.path, "tsconfig.json"), this.tsconfig!);
    this.files.writeJsonSync(
      join(this.path, "package.json"),
      this.packageJson!,
    );
  }

  removeReferenceTo(dependency: Package) {
    const {
      references,
      compilerOptions: { paths },
    } = this.tsconfig!;
    const refIndex = references.findIndex((ref) =>
      ref.path.endsWith(`/${dependency.dirName}`),
    );
    if (refIndex >= 0) {
      references.splice(refIndex, 1);
    }

    if (paths[dependency.name]) {
      delete paths[dependency.name];
    }

    const { dependencies } = this.packageJson!;
    if (dependencies[dependency.name]) {
      delete dependencies[dependency.name];
    }

    const watch = this.packageJson?.nodemonConfig?.watch;
    if (watch) {
      const index = watch.findIndex((path) =>
        path.endsWith(`/${dependency.dirName}/lib`),
      );
      if (index >= 0) {
        watch.splice(index, 1);
      }
    }

    this.files.writeJsonSync(join(this.path, "tsconfig.json"), this.tsconfig!);
    this.files.writeJsonSync(
      join(this.path, "package.json"),
      this.packageJson!,
    );
  }

  private getNameWithoutScope() {
    if (!this.name.startsWith("@")) {
      return this.name;
    }

    const delimPos = this.name.indexOf("/");
    if (delimPos < 2) {
      throw new CliError(
        "Scoped name starts with '@', but does not contain a '/'.",
      );
    }

    return this.name.substr(delimPos);
  }
}
