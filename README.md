# Create TypeScript Project ![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=main)

Create TypeScript monorepo projects with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html), [jest](https://jestjs.io/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/); an automated lint/test/build on every push to GitHub; and an (optional) automated publish to npm on every push of a version tag to GitHub.

**The short version: It's like Create React App for TypeScript monorepos, with scripts for CI and package publishing thrown in.**

If you have questions or something doesn't "just work", feel free to [submit an issue](https://github.com/jtbennett/create-ts-project/issues/new). You can find me on Twitter [@jtbennett](https://twitter.com/jtbennett).

## Quickstart

Create a new project:

```bash
yarn create @jtbennett/ts-project my-proj
cd my-proj
```

You now have a monorepo ready for development. Open `my-proj` in VS Code or your editor of choice.

Some example `tsp` commands:

```bash
# Add a server app:
yarn tsp add my-server --template node-server
# The app is created at ./packages/my-server

# Run the server in dev mode:
yarn workspace my-server dev
# The server is running at http://localhost:3000

# Add a library package (-t is the same as --template):
yarn tsp add my-lib -t node-lib

# Add a reference from the server app to the library package:
yarn tsp ref --from my-server --to my-lib
```

Other useful scripts (see [Yarn scripts](#yarn-scripts) for a full list):

```bash
# Run tests for just the my-lib package:
yarn workspace my-lib test

# Run tests for all packages:
yarn test:all

# Delete build outputs for all packages:
yarn clean:all

# Lint, test and do a clean build all packages:
yarn verify:all

```

## Contents

- [Why?](#why)

- [Create a project](#create-a-project)

- [Getting started with tsp](#getting-started-with-tsp)

- [`tsp` command details](#tsp-command-details)

- [Yarn scripts](#yarn-scripts)

- [Philosophy](#philosophy)

- [Tools included](#tools-included)

- [Alternatives](#alternatives)

- [Contributing](#contributing)

- [License](#license)

## Why?

**_A monorepo..._**

A lot of my work is building APIs and web apps, often with NodeJS and React and in TypeScript. It's common to have both the NodeJS web server and the React client app in the same project.

I also tend to split larger apps into separate packages -- both to organize the code and to keep me honest about the architecture. That's true even when I don't plan to publish anything to npm.

As a result, these projects are usually monorepos -- multiple packages/apps in the same repo.

**_...plus a lot of interdependent tools..._**

A typical project involves configuring TypeScript, jest, eslint, prettier, nodemon, Docker, VS Code, a CI process in GitHub Actions or CircleCI or TravisCI or Jenkins, deployments to Heroku or AWS or Azure or Google Cloud, and sometimes publishing to npm.

**_...involves a lot of configuration effort..._**

Separately, each of those tools is straightforward to use.

Getting them all working together in harmony takes effort. For example, we want Jest to be able to find and run our tests, but we don't want test-related files in our build output that will be deployed.

Doing it in a monorepo is more effort. For example, yarn workspaces helps save time and disk space by hoisting and sharing dependencies, but how do we deploy an app with just the specific dependencies it needs?

And keeping them working consistently for all members of a team -- even more effort. For example, does that one person whose linter is using different rules keep breaking the build? Or do semicolons and whitespace make your diffs more difficult to read?

**_...and ongoing hassle..._**

Adding a dependency between two packages in a monorepo sounds simple: run the yarn or npm or lerna command and you're done.

But are you?

- Does your dev server restart when a file in one of its dependencies changes?

- Does TypeScript in your editor know how to resolve types across dependencies so it can highlight errors, offer code completion and navigate source code across packages with "Go to definition (F12)"?

- Do the eslint rules that check TypeScript types work across dependencies?

- Can Jest resolve the dependencies when you run tests?

- When built for deployment, can the transpiled .js files be resolved by node?

**_...which keeps you from focusing on the actual product._**

I'd like everyone on the team to have all that "just work", so we can focus on the actual thing we're trying to build. That's the goal for Create Typescript Project.

## Create a project

_It is not recommended to install the `create-ts-project` package. Instead, use `yarn create` or `npx` to run it as a command._

Prerequisites:

- Install [node >=12.0](https://nodejs.org). (_node 10.x and 11.x will work, but require a couple of tweaks._)

- Install [yarn >=1.12, <2.0](https://classic.yarnpkg.com) globally (`npm install -g yarn`).

To create a new project, open a terminal and run:

```bash
yarn create @jtbennett/ts-project my-proj
# or: npx @jtbennett/create-ts-project my-proj
cd my-proj
```

Running that command will create a directory called `my-proj` inside the current folder. Inside that directory, it will generate the initial project structure and install all the tools and other devDependencies.

**Project structure**

```
my-proj
├── _tmp
│   └── about_tmp.md
├── .github
│   └── workflows
│       └── build.yml
├── .vscode
│   ├── extensions.json
│   ├── launch.json
│   ├── settings.json
│   └── tasks.json
├── .yarn
│   ├── plugins
│   └── releases
├── config
│   ├── tsconfig.base.json
│   ├── tsconfig.browser.json
│   └── tsconfig.node.json
├── node_modules
├── packages
│   └── about-packages.md
├── .dockerignore
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .yarnrc.yml
├── Dockerfile
├── package.json
├── README.md
└── yarn.lock
```

Primarily, the files are standard config files for node, TypeScript, jest, eslint, nodemon, git and VS Code. There is also a GitHub Action to lint, test and build on each push to the main branch.

You shouldn't need to make any configuration changes. But if you'd like to know the gory details, see [Configuration](./docs/configuration.md) for more info.

Your code will go in the `packages` directory.

## Getting started with `tsp`

`tsp` -- the `ts-project-scripts` CLI -- was installed as a devDependency when you ran the create command above.

`tsp` is used to add packages, which is really just copying a template into the `packages` folder. More importantly, it is used to manage references (dependencies) between packages. It updates the various config files so all the tools work as intended.

A "package" can be a web server, a command-line tool, a standalone library -- pretty much anything written in TypeScript that has a `package.json` file and a `tsconfig.json` file.

`tsp` includes some templates, and it's easy to create your own template. Each template contains the scripts, config files, and file structure needed to be ready for development.

Let's walk through the same steps as listed in the Quickstart above, but with some explanation along the way.

### Add a node server

Add a node server package:

```bash
yarn tsp add my-server --template node-server
```

The package is created at: `./packages/my-server`. It contains these files:

```
my-server
├── src
│   ├── index.test.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

Now you can use the scripts included in its `package.json` file to build, test, lint or run the server. Let's run it as you would for development:

```bash
yarn workspace my-server dev
```

You'll see some messages from `tsc` and `nodemon`, and the output of the server: "MY-SERVER: Hello world". The server is a basic [express](https://expressjs.com) server. You can open your browser to [http://localhost:3000](http://localhost:3000) to see the same message.

If you save a change to `./packages/my-server/src/index.ts`, you'll see the server restart.

_You don't have to use express to use this template. Delete the dependency on express and use whatever web server framework you like. The `dev` script and other configuration is what makes this template suitable for server apps._

### Add a library package

To create another package, use the same command as above, but specify a different template. This time we'll use the shorthand `-t` instead of `--template`. Stop the server with `Ctrl-C` and run:

```bash
yarn tsp add my-lib -t node-lib
```

Now let's consume my-lib from my-server.

### Add a reference (dependency) between packages

This is the conceptual equivalent of adding a dependency in `package.json`. `tsp` makes that change for you, as well as making corresponding changes to nodemon, TypeScript and other configs.

You first need to stop the server with `Ctrl-C`. Then, to add the reference and restart the server:

```bash
yarn tsp ref --from my-server --to my-lib
yarn workspace my-server dev
```

Open `./packages/my-server/src/index.ts` and save the following changes:

```typescript
// Add this at the top of the file.
import message from "my-lib";

// Delete this line from the middle of the file:
const message = `...`;
```

ESlint will highlight unused variables, but the app will still run.

When you save the file, you should see in your terminal that nodemon noticed the change and restarted the server. The message is now from `my-lib`. You can also refresh [http://localhost:3000](http://localhost:3000) in your browser to see the message from `my-lib`.

Now make a change to the exported string value in `./packages/my-lib/src/index.ts` -- in the referenced package -- and save.

In the dev server, you will see `tsc` recompile, the server restart, and the new message from `my-lib`.

### Remove a reference (dependency) between packages

This is the conceptual equivalent of removing a dependency in `package.json`. `tsp` does that for you, as well as making corresponding changes to nodemon, TypeScript and other configs.

```bash
yarn tsp unref --from my-server --to my-lib
```

You _should_ see an error in the server, because `./packages/my-server/src/index.ts` still contains an import from `my-lib`, which is no longer referenced.

_Unfortunately, you won't actually see an error._ But you _will_ see the linter highlighting the problem in your editor. The linter will also generate an error when it is run at the command line.

### Cleaning up

You can stop the dev server (with `Ctrl-C`) and completely delete the `my-server` and `my-lib` directories. You will need to rerun `yarn` after deleting them, so that it knows that those workspaces no longer exist.

`tsp` does not make any changes outside of the individual package directories, and never deletes files or directories.

Of course, you can also delete the entire project and generate a new one.

## `tsp` command details

`tsp` is a CLI that does three things:

- Creates new packages in the `packages` folder, based on templates that integrate with the rest of the configuration.

- Adds and removes references (dependencies) between packages. This involves updates to `package.json`, `tsconfig.json`, `jest` configuration, etc. `tsp` makes these configuration changes for you. And that's _all_ it does when adding and removing reference: update config files.

- Publishes packages to npm. This only happens if you explicitly decide you want it. But if you do, it's a very straightforward process. Configure it once in just a few minutes, and it will then run automatically whenever you push a new version tag to your GitHub repo.

### `--help` option

You can get help for `tsp` in the terminal with:

```bash
# List all commands:
yarn tsp --help

# Show help for a specific command:
yarn tsp <command> --help
```

### `tsp add <package> --template <template> [--dir <dir-name>]`

Adds a new package to the `packages` directory, based on a template.

If a package will be published under an npm @scope, the @scope must be included in the package name (e.g., `@my-org/my-package`). The package directory will be name of the package _without_ the scope (e.g., `my-package`).

```bash
yarn tsp add my-package --template node-lib
# Package will be created at: ./packages/my-package.

yarn tsp add @my-org/my-package --template node-lib
# Package will be created at: ./packages/my-package.
```

You can specify a custom directory name using the `--dir` argument:

```bash
yarn tsp add my-package --template node-lib --dir custom-name
# Package will be created at: ./packages/custom-name.
```

#### Included templates

The following templates are included with `tsp`:

- **node-cli.** Use this for command-line interfaces (CLIs).

  The template has a dependency on `yargs` , but you can remove it and use whatever frameworks you like.

  ```bash
  yarn tsp add my-cli --template my-cli

  # The dev script runs the CLI with no arguments in watch mode:
  yarn workspace my-cli dev

  # While working on a specific command, pass the appropriate args:
  yarn workspace my-cli dev foo -bar baz
  ```

  When you build this template, `chmod +x ./lib/index.js` is run, so that the file can be executed directly, without specifying `node`.

  _Note: `chmod` doesn't exist in Windows dev environments unless you are using WSL. You can remove the `chmod` command from the build script in `package.json`, but then your cli may not work as a standalone executable. I'd love suggestions for how to do this effectively/correctly in Windows._

- **node-lib.** Use this for a library that will be used in a node application.

  ```bash
  yarn tsp add my-lib --template node-lib

  # The dev script builds in watch mode:
  yarn workspace my-lib dev
  ```

  See the [`ref`](#ref) command to add a reference to the library from another library or app package. That will ensure the library is rebuilt as needed.

- **node-server.** Use this for web/api apps. `nodemon` is configured to restart the server when source files change.

  The template has a dependency on `express` , but you can remove it and use whatever frameworks you like.

  ```bash
  yarn tsp add my-server --template node-server

  # The dev script runs the server in watch mode.
  yarn workspace my-server dev
  ```

- **browser-lib.** Use this for a library that will be used in a browser application (e.g., a React app).

  ```bash
  yarn tsp add my-lib --template browser-lib

  # The dev script builds in watch mode:
  yarn workspace my-lib dev
  ```

  See the [`ref`](#ref) command to add a reference to the library from another library or app package. That will ensure the library is rebuilt as needed.

- **create-react-app.** Use this to integrate a React app generated from `create-react-app` with a `create-ts-project` repo.

  This "template" actually runs [create-react-app](https://github.com/facebook/create-react-app) with the `--template typescript` option. It then updates the `tsconfig.json` and `package.json` to integrate with the rest of the repo.

  ```bash
  yarn tsp add my-app --template create-react-app

  # CRA uses the "start" script to run a dev server.
  # "dev" was created as an alias by create-ts-project.
  # You can use either "start" or "dev".
  yarn workspace my-app dev
  ```

#### Custom templates

You can create your own templates anywhere in your file system, and use them with the `add` command.

To use a custom template, pass a path **relative to the project root** to the `add` command. For example, if you have a template you want to use for all your express-based web servers:

```bash
# In this example, `my-templates` is a sibling of the project's root directory.
yarn tsp add my-package --template ../my-templates/my-express-app
```

All files in the directory and any subdirectories will be copied. Any directories or files with names beginning with `_tsp_` will have that prefix removed. (This is done to avoid issues when packaging templates for publishing.).

The only change made to file contents is to set the `name` property of `package.json` (or `_tsp_package.json`) to the name givin to the `add` command (e.g., `my-package`).

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

### `tsp rename --from <old-name> --to <new-name> [--dir <dir-name>]`

_Docs coming soon..._

Renames a package and updates all references to it.

### `tsp ref --from <from-pkg> --to <to-pkg>`

Adds a reference so that one package in the project can import modules from another package in the project.

```bash
yarn tsp ref --from my-server --to my-lib
```

In a .ts file in my-server, you can now write:

```typescript
import foo from "my-lib";
```

_Note: After adding a reference from a server package (created from the `node-server` template) to another package, you will need to stop and start the server if it is running with the `dev` script. The `ref` command adds the referenced package to the `nodemon` list of watched files, and `nodemon` must be restarted to pick up the change._

### `tsp unref --from <from-pkg> --to <to-pkg>`

Removes a reference from one package to another.

```bash
yarn tsp unref --from my-server --to my-lib
```

To remove all references to a package, use `--all`:

```bash
yarn tsp unref --all --to my-lib
```

_Note: This command does **not** delete the package directory. That is left to the developer._

### `tsp publish`

_Docs coming soon..._

One-time configuration: Follow the instructions in the `./.github/workflows/build.yml` file in your CTSP-generated project.

Then you can publish a new version of the packages you choose with:

```bash
git tag v1.2.3
git push --tags
```

### `tsp dockerfile`

_Docs coming soon..._

Meant to be run during a CI process. Modifies the Dockerfile included in the template so that all the correct files are included for a build, and also for apps that are to be deployed.

### `tsp bundle <pkg-name | --all>`

_Docs coming soon..._

Meant to be run from within the Dockerfile during the CI process. "Bundles" an app for deployment. For apps, moves the build version of all referenced packages (workspaces in the same repo) and all their transitive dependencies that are required under the app node_modules.

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

    Uses `concurrently` to simultaneously:
    
    - Build the server in watch mode.

    - Run the server in `nodemon`. `nodemon` restarts `node` on each file change. See the `nodemonConfig` property of `package.json` for the exact config.

  - **node-cli**

    Builds and runs the CLI entry point script. Any parameters passed to dev are forwarded to the CLI.

    ```bash
    # This will pass 'foo --bar baz' to your CLI entry point.
    yarn dev foo --bar baz
    ```

  - **node-lib**

    Builds the library in watch mode, so it rebuilds on each file change.

    _Note: Libraries are automatically built by the projects that reference them and rebuilt when files change (in watch mode). You won't typically run the `dev` script for a library._

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

## VS Code tasks

All of the root-level yarn scripts are also available as VS Code tasks. When you choose Run Tasks, you will see them listed.

In addition, the `tsp add`, `tsp ref` and `tsp unref` commands are also available as tasks. These will prompt you to input package names and provides a drop-down for selecting a template for `tsp add`.

I recommend that you also create a task to run each server in your repo in dev mode. A sample is included in the `./.vscode/tasks.json` file. Uncomment it and simply replace `my-server` with the directory name of your server package.

## Philosophy

- **It just works.** All the tools should work well together out of the box, without needing additional configuration.

- **No magic.** Everything is done with standard configuration files for typescript, node, eslint, jest, prettier, nodemon, etc. Customize them as you like, or create your own templates.

- **Be practical.** There are a few compromises in this setup. For example, an extra build has to happen before running the node-server template in watch mode, to avoid a race between the compiler and nodemon. Those compromises will be removed if and when the tools make it possible. In the meantime, they're small and probably won't be noticeable.

## Tools included

See [Configuration](./docs/configuration.md) for more info on how each of the tools is configured.

For development:

- TypeScript - language, uses project references.
- jest - testing.
- eslint - linting.
- yarn v1.x - package management and running scripts.
- prettier - formatting code.
- Docker - running dev-time dependencies like databases. _Coming soon!_
- VS Code - code editor. (Not required, but you may need to configure other editors for linting, formatting, etc.)

For continuous integration (CI):

- GitHub Actions - running continuous integration (CI) lint, test and build. Optionally publishing to npm.
- GitHub packages - hosting docker images _Coming soon!_
- Docker - output of build process for applications is a Docker image. _Coming soon!_

The more of those tools that you use, the more useful CTSP may be, but most can be removed or replaced if you want to go through the effort of configuring an alternative. That said, it probably makes little sense to use this template if you aren't primarily using TypeScript.

## Alternatives

A million boilerplate repos and create-\* scripts are out there. You may find others more to your liking. This one is set up the way I like to work. I'll be thrilled if someone else finds it helpful.

## License

Create TypeScript Project is licensed under the [MIT license](./LICENSE).

[License notices](./docs/licenses.md) for third-party software used in this project.
