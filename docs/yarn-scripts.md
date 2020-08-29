# Yarn scripts

This document describes the `yarn` scripts available in the root `package.json` of a project generated with `create-ts-project`, as well as the scripts included in the package templates used by `tsp` (`ts-project-scripts`).

## Root-level scripts

When you create a project with `create-ts-project`, a number of scripts are included in the root-level `package.json` file. You can run these scripts with `yarn [script name]`. The current working directory must be somewhere inside the project.

Most of the root-level scripts are simply shortcuts to run the similarly named script in each package/workspace. For example, the root-level `verify:all` script runs the `verify` script in each package/workspace.

_Each package directory is a yarn workspace. See [yarn config](./configuration#yarn) for more info._

The root-level scripts that simply call the corresponding script in each package/workspace are:

- `lint:all`
- `test:all`
- `clean:all`
- `build:all`
- `verify:all`
- `purge:all`

For details on what each of those scripts does, see [Package-level scripts](#package-level-scripts) below.

_Note: **The corresponding scripts must exist in all packages** or yarn will exit with an error. If you don't want a package-level script to do anything, you can make its value `echo`._

In addition, there are root-level scripts that don't have an equivalent at the package level:

- **`version:all <version>`**

  The version argument should be a valid npm version number like `1.2.3` or `2.0.0-beta.1`.

  This script is helpful when publishing packages to npm. It does three things:

  - Sets the version property in all `package.json` files (including the root) to the specified version.
  - Commits those changes to your repo.
  - Creates a tag in the form: `v1.2.3`.

- **`tsp`**

  A shortcut to run `tsp`. This means in the project root, you can run `yarn tsp <command> [options]` instead of `./node_modules/.bin/tsp <command> [options]`.

## Package-level scripts

All templates include the same set of package-level scripts.

You can run them in two ways, depending on your current working directory. From any directory inside the project, you can use this format:

```bash
yarn workspace my-package test
```

From inside a specific package directory, you can use the shorter form:

```bash
cd ./packages/my-package
yarn test
```

The following scripts do the same thing in every template:

- **`tsp`**

  Runs `tsp` in the context of this package. For example:

  ```bash
  cd ./packages/my-server
  yarn tsp add my-lib
  ```

  Will add a dependency on `my-lib` to `my-server`.

- **`lint`**

  Lints the package with eslint. Warnings will be displayed, but do not cause linting to fail.

  _Because we use eslint rules that perform TypeScript type checks, linting a package that references other packages requires that the packages be built first. See [eslint config](./confiuguration.md#eslint) for more info._

- **`test`**

  Runs all tests in the package with jest. Add the `--coverage` option to generate a test coverage report.

- **`clean`**

  Deletes all build outputs for the package. See [TypeScript config](./configuration#typescript) for more info.

- **`verify`**

  Runs test, clean, build, and lint scripts, as described above. The only difference is that `verify` tells eslint to fail if there are any warnings.

- **`purge`**

  Runs the `clean` script to delete build outputs, and also deletes the package's `node_modules` and `coverage` folders.

The `dev` and `build` scripts are different in each package template, because the appropriate action depends on the type of package.

- **`dev`**

  - **node-server**

    Uses `concurrently` to simultaneously:

    - Build the server in watch mode.

    - Run the server in `nodemon`. `nodemon` restarts `node` on each file change. See the `nodemonConfig` property of `package.json` for the exact config.

  - **node-cli**

    Builds and runs the CLI entry point script. Any parameters passed to dev are forwarded to the CLI.

    ```bash
    # This will pass 'foo --bar baz' to your CLI entry point.
    yarn workspace my-cli dev foo --bar baz
    ```

  - **node-lib**

    Builds the library in watch mode, so it rebuilds on each file change.

    _Note: Libraries are automatically built and watched for changes by the projects that reference them. You won't typically run the `dev` script for a library._

- **`build`**

  - **node-server** - Builds the package.

  - **node-cli** - Builds the package and sets the entry point file to be executable (with `chmod +x`).

  - **node-lib** - Builds the package.

The remaining scripts are the same in all package templates:

## VS Code tasks

All of the root-level yarn scripts are also available as VS Code tasks. When you choose Run Tasks, you will see them listed.

In addition, the `tsp create`, `tsp add` and `tsp remove` commands are also available as tasks. These will prompt you to input package names and provide a drop-down for selecting a template for `tsp create`.

I recommend that you also create a task to run each server in your repo in dev mode. A sample is included in the `./.vscode/tasks.json` file. Uncomment it and simply replace `my-server` with the directory name of your server package.
