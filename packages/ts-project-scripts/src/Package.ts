import { basename, join } from "path";
import {
  getFiles,
  CliError,
  Files,
  Tsconfig,
  PackageJson,
} from "@jtbennett/ts-project-cli-utils";
import { getPaths, Paths } from "./paths";

const tsconfigBuildFile = "tsconfig.build.json";
const packageFile = "package.json";
const srcDir = "src";
const libDir = "lib";

export class Package {
  paths: Paths;
  files: Files;
  name: string;
  template: string;
  dir: string;
  dryRun: boolean;
  tsconfig?: Tsconfig;
  packageJson?: PackageJson;
  path: string;

  constructor(options: {
    name: string;
    template?: string;
    dir?: string;
    dryRun?: boolean;
    tsconfig?: Tsconfig;
    packageJson?: PackageJson;
  }) {
    this.files = getFiles();
    this.paths = getPaths();
    this.name = options.name;
    this.template = options.template || "";
    this.dir = options.dir || this.getNameWithoutScope();
    this.dryRun = !!options.dryRun;
    this.tsconfig = options.tsconfig;
    this.packageJson = options.packageJson;

    this.path = this.paths.getPackagePath(this.dir);
  }

  static loadAll() {
    return getPaths()
      .getAllPackagePaths()
      .map((path) => Package.load(path));
  }

  static load(path: string) {
    const files = getFiles();

    const tsconfig = files.readJsonSync<Tsconfig>(
      join(path, tsconfigBuildFile),
    );
    tsconfig.references = tsconfig.references || [];

    const packageJson = files.readJsonSync<PackageJson>(
      join(path, packageFile),
    );
    packageJson.dependencies = packageJson.dependencies || {};

    const name = packageJson.name;
    const dir = basename(path);

    return new Package({ name, dir, packageJson, tsconfig });
  }

  create() {
    const templatePath = this.paths.getTemplatePath(this.template);

    this.files.copySync(templatePath, this.path);

    const path = this.files.dryRun ? templatePath : this.path;
    const name = this.files.dryRun ? "_tsp_" + packageFile : packageFile;

    const json = this.files.readJsonSync(join(path, name));
    json.name = this.name;
    this.files.writeJsonSync(join(path, name), json);

    this.packageJson = json;
    this.tsconfig = this.files.readJsonSync(join(path, name));
  }

  setVersion(version: string) {
    const packageJsonPath = join(this.path, packageFile);
    const json = this.files.readJsonSync(packageJsonPath);
    json.version = version;
    this.files.writeJsonSync(packageJsonPath, json);
  }

  addReferenceTo(dependency: Package) {
    const { references } = this.tsconfig!;

    const refIndex = references.findIndex((ref) =>
      ref.path.endsWith(`/${dependency.dir}/${tsconfigBuildFile}`),
    );
    if (refIndex < 0) {
      references.push({ path: `../${dependency.dir}/${tsconfigBuildFile}` });
    }

    const { dependencies } = this.packageJson!;
    if (!dependencies[dependency.name]) {
      dependencies[dependency.name] = "*";
    }

    const { jest } = this.packageJson!;
    if (jest) {
      jest.moduleNameMapper = jest.moduleNameMapper || {};
      if (!jest.moduleNameMapper[dependency.name]) {
        jest.moduleNameMapper[
          dependency.name
        ] = `<rootDir>/../${dependency.dir}/${srcDir}`;
      }
    }

    const watch = this.packageJson?.nodemonConfig?.watch;
    if (watch) {
      const index = watch.findIndex((path) =>
        path.endsWith(`/${dependency.dir}/${libDir}`),
      );
      if (index < 0) {
        watch.push(`../${dependency.name}/${libDir}`);
      }
    }

    this.files.writeJsonSync(
      join(this.path, tsconfigBuildFile),
      this.tsconfig!,
    );
    this.files.writeJsonSync(join(this.path, packageFile), this.packageJson!);
  }

  removeReferenceTo(dependency: Package) {
    let tsconfigChanged = false;
    let packageJsonChanged = false;

    const { references } = this.tsconfig!;
    const refIndex = references.findIndex((ref) =>
      ref.path.endsWith(`/${dependency.dir}/${tsconfigBuildFile}`),
    );
    if (refIndex >= 0) {
      references.splice(refIndex, 1);
      tsconfigChanged = true;
    }

    const { dependencies } = this.packageJson!;
    if (dependencies[dependency.name]) {
      delete dependencies[dependency.name];
      packageJsonChanged = true;
    }

    const { jest } = this.packageJson!;
    if (jest?.moduleNameMapper && jest.moduleNameMapper[dependency.name]) {
      delete jest.moduleNameMapper[dependency.name];
      packageJsonChanged = true;
    }

    const watch = this.packageJson?.nodemonConfig?.watch;
    if (watch) {
      const index = watch.findIndex((path) =>
        path.endsWith(`/${dependency.dir}/${libDir}`),
      );
      if (index >= 0) {
        watch.splice(index, 1);
        packageJsonChanged = true;
      }
    }

    if (tsconfigChanged) {
      this.files.writeJsonSync(
        join(this.path, tsconfigBuildFile),
        this.tsconfig!,
      );
    }

    if (packageJsonChanged) {
      this.files.writeJsonSync(join(this.path, packageFile), this.packageJson!);
    }
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
