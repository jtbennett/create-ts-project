# Package templates

## What's in a package template

The minimum file structure for a template is:

```
my-template
├── src
│   ├── index.test.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

- `index.test.ts`: Contains a default test that will always succeed. You can delete this file or rename it to whatever you like.

- `index.ts`: For applications, this file is the entry point into your application - the file that will be executed. For libraries, all modules should be exported from this file. If you rename this file, you must update the `main`, `types` and `bin` in `package.json` to point to the renamed file.

- `package.json`: Standard manifest file for node/npm packages. See below for details.

- `tsconfig.json`: TypeScript configuration file used during development and when executing tests. See below for details.

- `ts.config.build.json`: TypeScript configuration file used when building for production.


## Included templates

The following templates are included with `tsp`:

- **node-cli.** Use this for command-line interfaces (CLIs).

  The template has a dependency on `yargs` , but you can remove it and use whatever cli framework you like.

  ```bash
  yarn tsp create my-cli --template my-cli

  # The dev script runs the CLI with no arguments in watch mode:
  yarn workspace my-cli dev

  # While working on a specific command, pass the appropriate args:
  yarn workspace my-cli dev foo --bar baz
  ```

  After each build, `chmod +x ./lib/index.js` is run, so that the file can be executed directly, without specifying `node`.

  _Note: `chmod` doesn't exist in Windows dev environments unless you are using WSL. You can remove the `chmod` command from the build script in `package.json`, but then your cli may not work as a standalone executable. I'd love suggestions for how to do this effectively/correctly in Windows._

- **node-lib.** Use this for a library that will be used in a node application.

  ```bash
  yarn tsp create my-lib --template node-lib

  # The dev script builds in watch mode:
  yarn workspace my-lib dev
  ```

  Use [`tsp add`](#tsp-add) to add a dependency on the library from another package. That will ensure the library is rebuilt as needed -- you will no longer need to explicitly build the library with the `dev` script.

- **node-server.** Use this for any long-running node process, like web/api servers. `nodemon` is configured to restart the server when source files change.

  The template has a dependency on `express` , but you can remove it and use whatever framework you like.

  ```bash
  yarn tsp create my-server --template node-server

  # The dev script runs the server in watch mode.
  yarn workspace my-server dev
  ```

  _Note: Stop the server (`Ctrl-C`) before adding a dependency on another package. After running `tsp add` or `tsp remove`, rerun `yarn workspace my-server dev`. This ensures that `tsc` and `nodemon` will rebuild and restart the server correctly when changes are made to the dependency._

- **browser-lib.** Use this for a library that will be used in a browser application (e.g., a React app).

  ```bash
  yarn tsp create my-lib --template browser-lib

  # The dev script builds in watch mode:
  yarn workspace my-lib dev
  ```

  _Note: See the [`tsp add`](#tsp-add) command to add a dependency on the library from another library or app package. That will ensure the library is rebuilt as needed -- you do not need to explicitly build the library with the `dev` script._

- **create-react-app.** Use this to integrate a React app generated from `create-react-app` with a `create-ts-project` repo.

  This "template" actually runs [create-react-app](https://github.com/facebook/create-react-app) with the `--template typescript` option. It then updates the `tsconfig.json` and `package.json` to integrate with the rest of the repo.

  ```bash
  yarn tsp create my-app --template create-react-app

  # CRA uses the "start" script to run a dev server.
  # "dev" was created as an alias by create-ts-project.
  # You can use either "start" or "dev".
  yarn workspace my-app dev
  ```

  _Note: Stop the CRA dev server (`Ctrl-C`) before adding a dependency on another package. After running `tsp add`, rerun `yarn workspace my-app dev`. This ensures that CRA hot reloading will work correctly when changes are made to the dependency._

## Custom templates

You can create your own templates anywhere in your file system, and use them with `tsp create` command.

To use a custom template, pass a path -- either absolute or **relative to the project root** -- to the `tsp create` command. For example, if you have a template you want to use for all your express-based web servers:

```bash
# In this example, `my-templates` is a sibling of the project's root directory.
yarn tsp create my-package --template ../my-templates/my-express-app
```

All files in the directory and any subdirectories will be copied. Any directories or files with names beginning with `_tsp_` will have that prefix removed. (This is done to avoid issues when packaging templates for publishing.).

The only change made to file contents is to set the `name` property of `package.json` to the name specified in the `create` command (e.g., `my-package`).

To work with the rest of the project, your template directory must look like this:

```
a-template
├── src
│   ├── index.test.ts [optional]
│   └── index.ts [either run your app or export values from here]
│   [Copy these files from another template]
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```
