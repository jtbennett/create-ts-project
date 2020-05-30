export interface PackageJson {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  devDependencies: { [key: string]: string };
  scripts: { [key: string]: string };
  nodemonConfig?: { watch: string[] };
  jest: {
    moduleNameMapper: { [key: string]: string };
  };
  tspConfig?: {
    bundle?: boolean;
    deploy?: boolean;
    publish?: boolean;
  };
}
