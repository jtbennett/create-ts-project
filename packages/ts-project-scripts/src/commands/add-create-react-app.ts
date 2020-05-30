import { execSync } from "child_process";

import { log } from "@jtbennett/ts-project-cli-utils";
import { TspScriptsOptions } from "../tspScriptsOptions";
import { Package } from "../Package";
import { getPaths } from "../paths";

const tsconfigContents = {
  references: [],
  extends: "../../config/tsconfig.browser.json",
  compilerOptions: {
    composite: false,
    noEmit: true,
    skipLibCheck: true,
    isolatedModules: true,
  },
  include: ["src"],
  exclude: ["src/jest", "src/**/*.test.ts", "src/**/__mocks__"],
};

export const addCreateReactApp = (
  args: TspScriptsOptions & {
    pkgName: string;
    dir?: string;
  },
) => {
  const dirName = args.dir || args.pkgName;
  const paths = getPaths();

  log.info(`Running create-react-app: ${paths.getPackagePath(dirName)}`);
  execSync(`yarnpkg create react-app ${dirName} --template typescript`, {
    cwd: paths.packagesPath,
    stdio: "inherit",
  });
  log.success("create-react-app succeeded.");

  // Overwrite tsconfig.json with our version.
  // We know there is exactly one tsconfig file.
  const pkg = Package.load(dirName);
  pkg.tsconfigs["tsconfig.json"] = tsconfigContents;

  // Add scripts to package.json
  const scripts = pkg.packageJson.scripts;
  scripts.dev = "react-scripts start";
  scripts.lint = "eslint ./src --ext .ts,.tsx --env browser";
  scripts.clean = "rimraf ./build";
  scripts.verify =
    "yarn test && yarn clean && yarn build && yarn lint --max-warnings 0";
  scripts.purge = "yarn clean && rimraf ./coverage ./node_modules";

  pkg.saveChanges();

  log.success("Updated tsconfig.json to integrate with create-ts-project.");
  log.success("Added scripts to package.json.");

  log.success("Run the new CRA app with:");
  log.info(`  yarn workspace ${pkg.name} dev `);
};
