# Create TypeScript Project ![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=master)

Create TypeScript monorepo projects with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html), [jest](https://jestjs.io/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/) configured and ready for development.

After creating a project, use the `tsp` command to create new packages as well as TypeScript project references and npm dependencies within the monorepo. Local development, file watching, linting and testing all just work.

_Coming soon: CI builds with [GitHub Actions](https://github.com/features/actions) and package publishing to npm just work._

If you have questions or something doesn't "just work", feel free to [submit an issue](https://github.com/jtbennett/create-ts-project/issues/new). You can find me on Twitter [@jtbennett](https://twitter.com/jtbennett)

**Contents**

- [Prerequisites](#prerequisites)

- [Create a project](#create-a-project)

- [Getting started with tsp](#getting-started-with-tsp)

  - [Add a node server](#add-a-node-server)
  - [Add a library package](#add-a-library-package)
  - [Add a reference (dependency) between packages](#add-a-reference-dependency-between-packages)
  - [Remove a reference (dependency) between packages](#remove-a-reference-dependency-between-packages)

- [`tsp` command details](#tsp-command-details)

  - [`tsp help` option](#tsp-help-option)
  - [`tsp add` command](#tsp-add-command)
  - [`tsp ref` command](#tsp-ref-command)
  - [`tsp unref` command](#tsp-unref-command)
  - [About package and directory names](#about-package-and-directory-names)

- [Yarn scripts](#yarn-scripts)

  - [Root-level scripts](#root-level-scripts)
  - [Package-level scripts](#package-level-scripts)

- [Philosophy](#philosophy)

- [Tools included](#tools-included)

- [Alternatives](#alternatives)

- [Contributing](#contributing)

- [License](#license)

## Prerequisites:

- Install [node >=12.0](https://nodejs.org).
- Install [yarn >=1.12, <2.0](https://classic.yarnpkg.com) globally (`npm install -g yarn`).

## Create a project

_It is not recommended to install the `create-ts-project` package. Instead, use `yarn create` or `npx` to run it._

To create a new project, open a terminal and run:

```bash
yarn create @jtbennett/ts-project my-proj
# or: npx @jtbennett/create-ts-project my-proj
cd my-proj
```

Running that command will create a directory called `my-proj` inside the current folder. Inside that directory, it will generate the initial project structure and install all the tools and other devDependencies:

```
my-proj
├── _tmp
│   └── about_tmp.md
├── .github
│   └── workflows
│       └── build.yml
├── .vscode
│   ├── extensions.json
│   └── settings.json
├── config
│   ├── jest.config.js
│   ├── tsconfig.eslint.json
│   └── tsconfig.node.json
├── node_modules
├── packages
│   └── about-packages.md
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── README.md
└── yarn.lock
```

Primarily, the files are standard config files for TypeScript, jest, eslint and git. There is also a GitHub Action to build on each push to master; and some config for VS Code.

Your code will go in the `packages` directory.

See [Configuration](./docs/configuration.md) for more info on how each of the tools is configured.

## Getting started with `tsp`

The `ts-project-scripts` CLI, or `tsp`, was installed as a devDependency when you ran the create command above.

`tsp` is used to add packages, which is really just copying a template into the `packages` folder. More importantly, it is used to manage references (dependencies) between packages. It uses yarn workspaces and TypeScript project references, and it does all the work updating the various config files, so you don't have to.

A "package" can be a web server, a command-line tool, a standalone library -- pretty much anything written in TypeScript.

`tsp` includes a bare-bones template for each of those three types of packages. (It's also easy to create your own template.) Each template contains the scripts, config files, and file structure needed to be ready for development.

Let's add a package...

### Add a node server

Add a node server package:

```bash
yarn tsp add my-server --template node-server
```

Your package is located at: `./packages/my-server`.

Now you can use the scripts included in its `package.json` file to build, test, lint or run the server. Let's run it as you would for development:

```bash
yarn workspace my-server dev
```

You'll see some messages from `tsc` and `nodemon`, and the output of the server: "Hello world" and a timestamp. (The "server" in the template is just a script that immediately exits.)

At any point while the server is running you can enter `rs` in the terminal window and the server will restart.

If you make a change to `./packages/my-server/src/index.ts` or any other source file, you'll see the server restart.

### Add a library package

You can do this in a separate terminal window, or stop the server first with `Ctrl-C`.

Use the same command as above, but specify a different template. This time we'll use the shorthand `-t` instead of `--template`:

```bash
yarn tsp add my-lib -t node-lib
```

That package has a default export -- a simple string. Let's import it into our server...

### Add a reference (dependency) between packages

This is the conceptual equivalent of adding a dependency in `package.json`. `tsp` does that for you, as well as making changes to the nodemon and TypeScript configs.

```bash
yarn tsp ref --from my-server --to my-lib
```

If you still have the server process running, you will have to manually restart it (due to a limitation in `ts-node`):

```bash
# Stop the server with Ctrl-C in the terminal window it is running. Then:
yarn workspace my-server dev
```

Now open `./packages/my-server/src/index.ts` and at the top of the file add:

```typescript
import aValue from "my-lib";

console.log(aValue);
```

When you save the file, you should see in your terminal that nodemon noticed the change and restarted the server, which logged the value that you just imported.

Now make a change to the string value in `./packages/my-lib/src/index.ts` and save. You should see the server restart and pick up your change.

### Remove a reference (dependency) between packages

This is the conceptual equivalent of removing a dependency in `package.json`. `tsp` does that for you, as well as making changes to the nodemon and TypeScript configs.

```bash
yarn tsp unref --from my-server --to my-lib
```

If you still have the server process running, you will have to manually restart it (due to a limitation in `ts-node`):

```bash
# Stop the server with Ctrl-C in the terminal window it is running. Then:
yarn workspace my-server dev
```

You will see an error, because `./packages/my-server/src/index.ts` is trying to import from `my-lib`, which is no longer referenced. Remove the import to `my-lib` and save

## `tsp` command details

- ### `tsp help` option

You can get help for `tsp` in the terminal with:

```bash
# List all commands:
yarn tsp --help

# Show help for a specific command:
yarn tsp <command> --help
```

- ### `tsp add` command

  Adds a new package to the `packages` directory, based on a template.

  The package name comes after `add`. If a package will be published under an npm @scope, the @scope must be included (e.g., `@my-org/my-package`). The package directory will be name of the package _without_ the scope (e.g., `my-package`).

  ```bash
  yarn tsp add my-package --template node-lib
  # Package located in: ./packages/my-package.

  yarn tsp add @my-org/my-package --template node-lib
  # Package located in: ./packages/my-package.
  ```

  You can specify a custom directory name using the `--dir` argument:

  ```bash
  yarn tsp add my-package --template node-lib --dir custom-name
  # Package located in: ./packages/custom-name.
  ```

  #### Included templates

  The following templates are included with `tsp`:

  - **node-cli.** Use this for command-line interfaces (CLIs).

    The template has dependencies on `yargs` and `chalk`, but you can remove those and use whatever frameworks you like.

    ```bash
    yarn tsp add my-cli --template my-cli

    # The dev script runs the CLI with no arguments in watch mode:
    yarn workspace my-cli dev

    # While working on a specific command, pass the appropriate args:
    yarn workspace my-cli dev foo -bar baz
    ```

    When you build this template, `chmod +x ./lib/index.js` is run, so that the file can be executed directly, without specifying `node`.

    _Note: `chmod` doesn't exist in Windows dev environments unless you are using WSL. You can remove the `chmod` command from the build script in `package.json`, but then your cli may not work as a standalone executable. I'd love suggestions for how to do this effectively/correctly in Windows._

  - **node-lib.** Use this for a library that will be published or that will contain code shared by other libraries/apps in the repo.

    ```bash
    yarn tsp add my-lib --template node-lib

    # The dev script builds in watch mode:
    yarn workspace my-lib dev
    ```

    See the [`ref`](#ref) command to add a reference to the library from another library or app package. That will ensure the library is rebuilt as needed.

  - **node-server.** Use this for web/api apps based on express, koa or other frameworks. `nodemon` is preconfigured to restart the server when source files change.

    ```bash
    yarn tsp add my-server --template node-server

    # The dev script runs the server in watch mode.
    yarn workspace my-server dev
    ```

    When running the template as-is, you'll see "Hello world" and a timestamp printed to the console. Make changes to the code and nodemon will restart the app.

  #### Custom templates

  You can create your own templates anywhere in your file system, and use them with the `add` command.

  To use a custom template, pass a path **relative to the project root** to the `add` command. For example, if you have a template you want to use for all your express-based web servers:

  ```bash
  # In this example, `my-templates` is a sibling of the project's root directory.
  yarn tsp add my-package --template ../my-templates/my-express-app
  ```

  All files in the directory and any subdirectories will be copied. Any directories or files with names beginning with `_tsp_` will have that prefix removed. (This is done to avoid issues when packaging templates for publishing.).

  The only change made to file contents is to set the `name` property of `package.json` (or `_tsp_package.json`) to the name givin to the `add` command (e.g., `my-package`).

- ### `tsp ref` command

  Adds a reference so that one package in the project can import modules from another package in the project.

  ```bash
  yarn tsp ref --from my-server --to my-lib
  ```

  In a .ts file in my-server, you can now write:

  ```typescript
  import foo from "my-lib";
  ```

  _Note: After adding a reference from a server package (created from the `node-server` template) to another package, you will need to stop and start the server if it is running with the `dev` script. The `ref` command adds the referenced package to the `nodemon` list of watched files, and `nodemon` must be restarted to pick up the change._

* ### `tsp unref` command

  Removes a reference from one package to another.

  ```bash
  yarn tsp unref --from my-server --to my-lib
  ```

  To remove all references to a package, use `--all`:

  ```bash
  yarn tsp unref --all --to my-lib
  ```

  _Note: This command does **not** delete the package directory. That is left to the developer._

### About package and directory names

All `tsp` commands require the package name as it is in `package.json`. If a package will be published under an npm @scope, the @scope must be included in the `tsp` command argument (e.g., `@my-org/my-package`).

The directory containing the package will not include any npm @scope. In the filesystem, the packages `a-package` and `@my-org/another-package` will be in directories `a-package` and `another-package`, respectively.

You can specify a custom directory name when creating a package with the `add` command using the `--dirName` argument. The other commands will locate the package without requiring the custom directory name to be specified.

## Yarn scripts

This document describes the `yarn` scripts available in the root `package.json` of a project generated with `create-ts-project`, as well as in the package templates used by `tsp` (`ts-project-scripts`).

### Root-level scripts

When you create a project with `create-ts-project`, a number of scripts are included in the root-level `package.json` file. You can run these with `yarn [script name]`. The current working directory must be inside the project, but _outside_ any package directories.

Most of the root-level scripts are simply shortcuts to run the similarly named script in each package/workspace. For example, the root-level `verify:all` script runs the `verify` script in each package/workspace.

_Each package directory is a yarn workspace. See [yarn config](./configuration#yarn) for more info._

The root-level scripts that simply all the corresponding script in each package/workspace are:

- `lint:all`
- `test:all`
- `clean:all`
- `build:all`
- `verify:all`
- `purge:all`

For details on what each script actually does, see [Package-level scripts](#package-level-scripts) below.

_Note: **The corresponding scripts must exist in all packages** or yarn will exit with an error. If you don't want a package-level script to do anything, you can make its value `echo`._

In addition, there is one root-level scripts that doesn't have an equivalent at the package level:

- **`tsp`**

  A shortcut to run `tsp`. This means in the project root, you can run `yarn tsp <command> [options]` instead of `./node_modules/.bin/tsp <command> [options]`.

### Package-level scripts

All templates include the same set of scripts.

The `dev` and `build` scripts are different in each package template, because the appropriate action depends on the type of package.

- **`dev`**

  - **node-server**

    Uses `concurrently` to build the server in watch mode and run it in `ts-node`.

    `nodemon` restarts the `ts-node` server on each file change. See the `nodemonConfig` property of `package.json` for the exact config. (Actually runs `concurrently` to work around a limitation of `ts-node`. See [nodemon config] for details.)

    _The build in watch mode is required because `ts-node` doesn't yet understand TypeScript project references._

  - **node-cli**

    Builds and runs the CLI entry point script using `ts-node`. Any parameters passed to dev are forwarded to the CLI.

    ```bash
    # This will pass 'foo --bar baz' to your CLI entry point.
    yarn dev foo --bar baz
    ```

    _The initial build is required because `ts-node` doesn't yet understand TypeScript project references._

  - **node-lib**

    Builds the library in watch mode, so it rebuilds on each file change.

    _Note: Libraries are automatically built by the projects that reference them and rebuilt when files change (in watch mode). The only case where you would typically run the `dev` script for a library is for a standalone package that you intend to publish to npm._

- **`build`**

  - **node-server** - Builds the package.

  - **node-cli** - Builds the package and sets the entry point file to be executable (with `chmod`).

  - **node-lib** - Builds the package.

The remaining scripts are the same in all package templates:

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

## Philosophy

- **It just works.** All the tools should work well together out of the box, without needing additional configuration.

- **No magic.** Everything is done with standard configuration files for typescript, node, eslint, jest, prettier, nodemon, etc. Customize them as you like, or create your own templates.

- **Be practical.** There are a few compromises in this setup. For example, an extra build has to happen before running the node-server template in watch mode, because `ts-node` doesn't yet understand project references. Those compromises will be remove if and when the tools make it possible. In the meantime, they're small and probably won't be noticeable.

## Tools included

See [Configuration](./docs/configuration.md) for more info on how each of the tools is configured.

For development:

- TypeScript - language, uses project references.
- jest - testing.
- eslint - linting.
- yarn v1.x - package management and running scripts.
- ts-node - running node-based apps written in typescript.
- prettier - formatting code.
- Docker - running dev-time dependencies like databases. _Coming soon!_
- VS Code - code editor. (Not required, but you may need to configure other editors for linting, formatting, etc.)

For continuous integration (CI): _Coming soon!_

- github actions - running continuous integration (CI) and deploying on each commit.
- github packages - hosting docker images
- Docker - output of build process for applications is a Docker image.

The more of those tools that you use, the more useful CTSP may be, but most can be removed or replaced if you want to go through the effort of configuring an alternative. That said, it probably makes little sense to use this template if you aren't primarily using TypeScript.

## Alternatives

A million boilerplate repos and create-\* scripts are out there. You may find others more to your liking. This one is set up the way I like to work. If it's useful for you, great!

## License

Create TypeScript Project is licensed under the [MIT license](./LICENSE).

[License notices](./docs/licenses.md) for third-party software used in this project.
