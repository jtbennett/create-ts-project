# Create TypeScript Project ![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=main)

Create TypeScript monorepo projects with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html), [jest](https://jestjs.io/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/); an automated lint/test/build on every push to GitHub; and an (optional) automated publish to npm on every push of a version tag to GitHub.

**The short version: It's like Create React App for TypeScript monorepos, with scripts for CI and package publishing thrown in.**

If you have questions or something doesn't "just work", feel free to [submit an issue](https://github.com/jtbennett/create-ts-project/issues/new). You can find me on Twitter [@jtbennett](https://twitter.com/jtbennett).

For detailed information on all `tsp` commands, see [`tsp` commands](./docs/tsp-commands.md)

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

_For detailed information on all `tsp` commands, see [`tsp` commands](./docs/tsp-commands.md)._

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

In addition, there are two root-level scripts that don't have an equivalent at the package level:

- **`version:all <version>`**

  The version argument should be a valid npm version number like `1.2.3` or `2.0.0-beta.1`.

  This script is helpful when publishing packages to npm. It does three things:

  - Sets the version property in all `package.json` files (including the root) to the specified version.
  - Commits those changes to your repo.
  - Creates a tag in the form: `v1.2.3`.

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

## Publishing packages to npm

### One-time setup for publishing

The [`.github/workflows/build.yml`](./.github/workflows/build.yml) file contains commented-out tasks that can publish your packages to npm automatically when you push a new git tag to github.

_Note: This setup only supports the case where all packages have the same version number._

To automate publishing of your packages:

- Add a secret to your github repo named `NPM_TOKEN` with a valid token for publishing to npm.

- Remove "private: true" from the package.json files of the packages you wish to publish. Fill out other metadata fields like license, author, description, etc.

- In [`.github/workflows/build.yml`](./.github/workflows/build.yml):

  - Uncomment the `Set publish version from tag` and `Publish` steps.

  - Under the `Publish` step, remove "--access public" if your package will not be public.

  - Replace `__PACKAGE_X__` with the name of a package you want to publish. (Include the @scope, if any.)

  - Duplicate the `yarn workspace ... npm publish ...` line for any additional packages you want to publish.

### Publish a new version

The package(s) will be published to npm when a tag like `v1.2.3` is pushed to github. (Where `1.2.3` is any valid npm version number.)

**Be sure the version in each package.json matches the tag value!**

The `version:all` yarn script (described above) will keep everything in sync for you:

```bash
yarn version:all 1.2.3
```

That script will:

- Set the version in package.json for all packages (including the root) to `1.2.3`.

- Commit those changes to your local copy of the repo.

- Tag the commit with `v1.2.3`.

Kick off a publish by pushing the tag to your github repo:

```bash
git push --follow-tags
```

If your build succeeds, the package(s) will be published to npm!

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
