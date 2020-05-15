import { basename } from "path";
import { files } from "./getFiles";
import { TspError } from "./TspError";

export interface Tsconfig {
  references: { path: string }[];
  compilerOptions: {
    paths: { [key: string]: string[] };
  };
}

export interface PackageFile {
  name: string;
  dependencies: { [key: string]: string };
  nodemonConfig?: { watch: string[] };
}

export class Package {
  name: string;
  template: string;
  dirName: string;
  dryRun: boolean;
  tsconfig?: Tsconfig;
  packageJson?: PackageFile;
  path: string;

  constructor(options: {
    name: string;
    template?: string;
    dirName?: string;
    dryRun?: boolean;
    tsconfig?: Tsconfig;
    packageJson?: PackageFile;
  }) {
    this.name = options.name;
    this.template = options.template || "";
    this.dirName = options.dirName || this.getNameWithoutScope();
    this.dryRun = !!options.dryRun;
    this.tsconfig = options.tsconfig;
    this.packageJson = options.packageJson;

    this.path = files.getPackagePath(this.dirName);
  }

  static loadAll() {
    return files.getAllPackagePaths().map((path) => Package.load(path));
  }

  static load(path: string) {
    const tsconfig = files.loadJson<Tsconfig>(path, "tsconfig.json");
    tsconfig.references = tsconfig.references || [];
    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};

    const packageJson = files.loadJson<PackageFile>(path, "package.json");
    packageJson.dependencies = packageJson.dependencies || {};

    const name = packageJson.name;
    const dirName = basename(path);

    return new Package({ name, dirName, packageJson, tsconfig });
  }

  async create() {
    const templatePath = files.getTemplatePath(this.template);

    await files.copyDir(templatePath, this.path);

    const json = files.loadJson(
      files.dryRun ? templatePath : this.path,
      "package.json",
    );
    json.name = this.name;
    files.saveJson(json, this.path, "package.json");

    this.packageJson = json;
    this.tsconfig = files.loadJson(this.path, "tsconfig.json");
  }

  async delete(force = false) {
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
        throw new TspError(
          `"${this.name}" is referenced by other packages. ` +
            "Use the '--force' option to remove the package and all references to it.\nReferenced by:\n\t" +
            dependents.map((r) => r.packageJson!.name).join("\n\t"),
        );
      }
    }

    await files.deleteDir(this.path);
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
      references.push({ path: `../${dependency.name}` });
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

    files.saveJson(this.tsconfig!, this.path, "tsconfig.json");
    files.saveJson(this.packageJson!, this.path, "package.json");
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

    files.saveJson(this.tsconfig!, this.path, "tsconfig.json");
    files.saveJson(this.packageJson!, this.path, "package.json");
  }

  private getNameWithoutScope() {
    if (!this.name.startsWith("@")) {
      return this.name;
    }

    const delimPos = this.name.indexOf("/");
    if (delimPos < 2) {
      throw new TspError(
        "Scoped name starts with '@', but does not contain a '/'.",
      );
    }

    return this.name.substr(delimPos);
  }
}
