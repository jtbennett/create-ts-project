# Create Typescript project ![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=master)

Create Typescript monorepo projects with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html), [jest](https://jestjs.io/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/) configured and ready for development.

Includes the `ts-project-scripts` command-line tool -- aka `tsp` -- to create new packages as well as Typescript project references and npm dependencies within the monorepo. Local development, file watching, linting and testing all just work.

_Coming soon: CI builds with [GitHub Actions](https://github.com/features/actions) and package publishing to npm just work._

If you have questions or something doesn't work, feel free to [submit an issue](https://github.com/jtbennett/create-ts-project/issues/new).

## Quick start

Prequisites:

- Install [node >=12.0](https://nodejs.org).
- Install [yarn >=1.12, <2.0](https://classic.yarnpkg.com) globally (`npm install -g yarn`).

To Create a new Typescript project, open a terminal and run:

```bash
yarn create @jtbennett/ts-project
# or: npx @jtbennett/create-ts-project my-proj
cd my-proj
```

Now you can use `tsp` to add and remove packages or references.

```bash
# Examples
yarn tsp add my-server --template node-server
yarn tsp add my-lib --template node-lib
yarn tsp ref --from my-server --to my-lib
```

See below for more details.

## `tsp` commands

When you created a project, the `tsp` CLI was installed. (`tsp` is short for `ts-project-scripts`.)

`tsp` commands allow you to easily add packages (server apps, cli apps, libraries) to your monorepo. It updates things like the `package.json` and `tsconfig.json` files so that everything just works.

Mix and match the sample commands below to create server apps, CLIs or shared libraries in the `packages` directory of your `my-proj` monorepo.

You can get help in the console with:

```bash
# List all commands:
yarn tsp --help

# Show help for a specific command:
yarn tsp <command> --help
```

- ### `add`

  Adds a new package to the `packages` directory, based on a template.

  Available templates are:

  - **node-server.** Use this for web/api apps based on express, koa or other frameworks. `nodemon` is preconfigured.

    ```bash
    yarn tsp add my-server --template node-server

    # The dev script runs the server in watch mode.
    yarn workspace my-server dev
    ```

    Until you add your own code, you'll see "Hello world" and a timestamp printed to the console. Make changes to the code and nodemon will restart the app.

  - **node-lib.** Use this for a library that will be published or that will contain code shared by other libraries/apps in the repo.

    ```bash
    yarn tsp add my-lib --template node-lib

    # The dev script builds in watch mode:
    yarn workspace my-lib dev
    ```

    See the [`ref`](#ref) command to add a reference to the library from another library or app package. That will ensure the library is rebuilt as needed.

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

- ### `ref`

  Adds a reference so that one package in the project can import modules from another package in the project.

  ```bash
  yarn tsp ref --from my-server --to my-lib
  ```

  In a .ts file in my-server, you can now write:

  ```typescript
  import foo from "my-lib";
  ```

- ### `unref`

  Removes a reference from one package to another. This includes both the Typescript project reference in `tsconfig.json` and the `package.json` `dependency`.

  ```bash
  yarn tsp unref --from my-server --to my-lib
  ```

  To remove all references to a package, use `--all`:

  ```bash
  yarn tsp unref --all --to my-lib
  ```

  This command does **not** delete the package directory. That is left to the developer.

### About package and directory names

When adding or referring to a package, use the name as you want it in `package.json`. The directory name will match, unless the package name is prefixed with an npm scope, like `@jtbennett` or `@material-ui`. In that case, the directory will be the package name without the prefix.

- Unscoped package: `my-lib`:

  - `name` property in `package.json` is `my-lib`
  - Directory is `packages/my-lib`
  - `tsp` commands:
    ```bash
    yarn tsp add my-server --template node-server
    yarn tsp add my-lib --template node-lib
    yarn tsp ref --from my-server --to my-lib
    ```

- Scoped package: `@myorg/my-lib`:

  - `name` property in `package.json` is `@myorg/my-lib`
  - Directory: `packages/my-lib`
  - `tsp` commands:
    ```bash
    yarn tsp add @myorg/my-server --template node-server
    yarn tsp add @myorg/my-lib --template node-lib
    yarn tsp ref --from @my-org/my-server --to @myorg/my-lib
    ```

## Philosophy

- It just works. All the tools should work well together out of the box, without needing additional configuration.

- No magic. Everything is done with standard configuration files for typescript, node, eslint, jest, prettier, nodemon, etc. The `tsp` commands simply modify those config files in the right ways to make it all work. Want to change linting rules or test setup? Go for it. (But please just leave the prettier rules alone! :wink:)

## What's included

Create Typescript Project generates a monorepo for Typescript-based projects, including node-based apps, front-tend apps created with create-react-app _(more info coming soon!)_, or packages intended for publishing on npm. The goal is to have a nice dev/build/deploy/publish experience without spending any time setting up the tools.

Although it is structured as a monorepo, Create Typescript Project may be useful even if you never publish packages. I tend to organize code in multiple packages even when I'm only consuming those packages from a single application and none of it is ever published to npm.

### Tools used

For development:

- typescript - language, uses project references.
- jest - testing.
- eslint - linting.
- yarn v1.x - package management and running scripts.
- ts-node - running node-based apps written in typescript without a separate transpile step.
- prettier - code formatting.
- Docker - running dev-time dependencies like databases.
- VS Code - code editor.

For continuous integration (CI): _Coming soon!_

- github actions - running continuous integration (CI) and deploying on each commit.
- github packages - hosting docker images
- Docker - output of build process is a Docker image.

The more of those tools that you use, the more useful this template may be, but most are easily removed or replaced. That said, it probably makes little sense to use this template if you aren't primarily using Typescript.

## Alternatives

A million boilerplate repos and create-\* scripts are out there. You may find others more to your liking. This one is set up the way I like to work. If it's useful for you, great!

## Contributing

This repo is itself an instance of the same project structure generated by Create Typescript Project, so the requirements are the same: `node >=12.0` and `yarn >=1.12, <2.0`

**One-time setup:**

```bash
# Fork the repo and clone your fork.
git clone https://github.com/yourgithubname/create-ts-project.git
cd create-ts-project
yarn
```

To run commands in local development:

```bash
yarn workspace create-ts-project dev [arguments]
yarn workspace ts-project-scripts dev [arguments]
```

To run tests: (There aren't any yet!!)

```bash
yarn workspace ts-project-cli-utils test --watch
yarn workspace create-ts-project test --watch
yarn workspace ts-project-scripts test --watch
```

Before creating a pull request, make sure this completes successfully:

```bash
yarn verify:all
```

## License

Create Typescript Project is licensed under the [MIT license](./LICENSE).
