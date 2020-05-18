export interface PackageJson {
  name: string;
  dependencies: { [key: string]: string };
  nodemonConfig?: { watch: string[] };
}
