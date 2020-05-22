# Create TypeScript Project ![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=master)

Create TypeScript monorepo projects with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html), [jest](https://jestjs.io/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/) configured and ready for development.

After creating a project, use the `tsp` command to create new packages as well as TypeScript project references and npm dependencies within the monorepo. Local development, file watching, linting and testing all just work.

_Coming soon: CI builds with [GitHub Actions](https://github.com/features/actions) and package publishing to npm just work._

If you have questions or something doesn't "just work", feel free to [submit an issue](https://github.com/jtbennett/create-ts-project/issues/new). You can find me on Twitter [@jtbennett](https://twitter.com/jtbennett)

## Prerequisites:

- Install [node >=12.0](https://nodejs.org).
- Install [yarn >=1.12, <2.0](https://classic.yarnpkg.com) globally (`npm install -g yarn`).

## Create a project

_It is not recommended to install this package. Instead, use `yarn create` or `npx` to run it._

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
└── README.md
```

Just standard config files for TypeScript, jest, eslint and git; a GitHub Action to build on each push to master; and some config for VS Code.

Your code will go in the `packages` directory.

## Getting started with `tsp`

The `ts-project-scripts` CLI, or `tsp` was installed as a devDependency when you ran the create command above.

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

You'll see some messages from `nodemon`, and the output of the server: "Hello world" and a timestamp. (The "server" in the template is just a script that immediately exits.)

If you make a change to `./packages/my-server/src/index.ts` and save it, you'll see the server restart. You can now add `express`, `koa` or any other web server framework, just as you would in any other project.

### Add a library package

Use the same command as above, but specify a different template. We'll use the shorthand `-t` instead of `--template`:

```bash
yarn tsp add my-lib --t node-lib
```

Your package is located at: `./packages/my-lib`.

That package has a default export -- a simple string. Let's import it into our server...

### Add a reference (dependency) between packages

```bash
yarn tsp ref --from my-server --to my-lib
```

Now open `./packages/my-server/src/index.ts` and at the top of the file add:

```typescript
import aValue from 'my-lib'

console.log(aValue);
```

When you save the file, you should see in your terminal that nodemon noticed the change and restarted the server, which logged the value that you just imported.

One more thing... `tsp ref` also updated the nodemon config, so that any changes in `my-lib` will also cause a restart of the server. But to pick up those change, you need to restart nodemon. Enter Ctrl-C to quit nodemon, then start it again as you did above:

```bash
yarn workspace my-server dev
```

Now make a change to the string value in `./packages/my-lib/src/index.ts` and save. You should see the server restart and pick up your change.

## `tsp` command details

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

## Philosophy

- It just works. All the tools should work well together out of the box, without needing additional configuration.

- No magic. Everything is done with standard configuration files for typescript, node, eslint, jest, prettier, nodemon, etc. Customize them as you like, or create your own templates.

- Be practical. There are a few compromises in this setup. For example, an extra build has to happen before running the node-server template in watch mode, because `ts-node` doesn't yet understand project references. Those instances will be optimized when the tools make it possible. In the meantime, the compromises are small and probably won't be noticeable.

## What's included

Create TypeScript Project generates a monorepo for TypeScript-based projects, including node-based apps, front-tend apps created with create-react-app _(more info coming soon!)_, or packages intended for publishing on npm. The goal is to have a nice dev/build/deploy/publish experience without spending any time setting up the tools.

Although it is structured as a monorepo, Create TypeScript Project may be useful even if you never publish packages. I tend to organize code in multiple packages even when I'm only consuming those packages from a single application and none of it is ever published to npm.

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

The more of those tools that you use, the more useful this template may be, but most are easily removed or replaced. That said, it probably makes little sense to use this template if you aren't primarily using TypeScript.

## Alternatives

A million boilerplate repos and create-\* scripts are out there. You may find others more to your liking. This one is set up the way I like to work. If it's useful for you, great!

## Contributing

This repo is itself an instance of the same project structure generated by Create TypeScript Project, so the requirements are the same: `node >=12.0` and `yarn >=1.12, <2.0`

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

To run tests: (There aren't any yet!)

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

Create TypeScript Project is licensed under the [MIT license](./LICENSE).
