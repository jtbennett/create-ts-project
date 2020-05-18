export interface Tsconfig {
  references: { path: string }[];
  compilerOptions: {
    paths: { [key: string]: string[] };
  };
}
