# `tsp` commands

`tsp` is a command-line interface (CLI) that is installed when you create a project folder with `create-ts-project`. It is a very simple tool to help you create packages in your project and add/remove dependencies between them.

In keeping with the `create-ts-project` philosophy, there is no magic.

When adding a package, `tsp` simply copies a template into your `packages` folder, updates a few things like the name in `package.json`, and runs `yarn`.

When adding or removing a dependency, `tsp` simply adds or removes values to various standard config files, like `tsconfig.json` and `package.json`, in order for tsc, nodemon, eslint, and jest to work as you would expect. After running a tsp command, you can modify those config files as you see fit.

That's **all** `tsp` does. It does not touch any files outside the `packages` folder. It does nothing at runtime.

## Package names, directory names, and npm scopes

All `tsp` commands that take a package name argument require the name as it is in `package.json`.

If you plan to publish one or more of your packages to the npm registry, you may opt to publish it under an (npm scope)[https://docs.npmjs.com/misc/scope]. In that case, the scope must be included in the `tsp` command argument (e.g., `@my-org/my-package`).

The directory containing the package will not include the npm scope.

The `create` and `rename` commands take the `--dir` argument, which allows you to set a different directory name. All other commands will locate a package by its name -- there is no need to specify the directory name.

Examples:

```bash
yarn tsp create my-server -t my-server
# package.json name = "my-server"
# package directory = "./packages/my-server"

yarn tsp create @my-org/my-library -t my-lib
# package.json name = "@my-org/my-library"
# package directory = "./packages/my-library"

yarn tsp create @my-org/my-library -t my-lib --dir some-other-name
# package.json name = "@my-org/my-library"
# package directory = "./packages/some-other-name"

yarn add -f my-server -t @my-org/my-library
# Always use the name of a package -- not the directory name -- in tsp commands.
```

## Global arguments

All `tsp` commands take the following arguments:

- `--help`. Show help.

- `--no-yarn`. Don't run yarn after the command. The default is to run it, so that yarn can update the symlinks it creates for packages (yarn workspaces) you have added, renamed or removed.

- `--verbose, -v`. Output more information while running a command.

```bash
# List all commands:
yarn tsp --help

# Show help for a specific command:
yarn tsp <command> --help
```

In the help, and in the descriptions below, arguments appearing in square brackets - e.g., `[--dir <dir-name>]` - are optional. All other arguments are required.

## Commands

### `tsp list`

`tsp list`

Lists all packages currently in the project, and which other packages they depend on.

### `tsp create`

`tsp create <pkg-name> --template <template> [--dir <dir-name>] [--no-yarn]`

Creates a new package in the `packages` directory, based on a [template](./package-templates.md).

Arguments:

- `<pkg-name>`

  Name of the package to create. Will be written to `package.json`. If a package will be published under an npm @scope, the @scope must be included in the package name (e.g., `@my-org/my-package`). The package directory will be name of the package _without_ the scope (e.g., `./packages/my-package`).

- `--template, -t <template>`

  Name of a built-in template or path of a custom template to use. See [Package templates](./package-templates.md) for the list of built-in templates. If a path is used, it is resolved relative to the project root.

- `--dir, -d <dir-name>`

  Create the package under `./packages/<dir-name>`. The name in `package.json` will still be `<pkg-name>`.

Examples:

```bash
yarn tsp create my-package --template node-lib
# package.json name = "my-package"
# package directory = "./packages/my-package"

yarn tsp create @my-org/my-package --template node-lib
# package.json name = "@my-org/my-package"
# package directory = "./packages/my-package"

yarn tsp create my-package --template node-lib --dir custom-name
# package.json name = "my-package"
# package directory = "./packages/custom-name"
```

### `tsp rename`

`tsp rename --from <old-name> --to <new-name> [--dir <dir-name>]`

Renames a package and/or its directory, and updates all inbound dependencies to the new name.

Arguments:

- `--from, -f <old-name>`

  Name of the package to be renamed.

- `--to, -t <new-name>`

  New name of the package. Will be written to `package.json`.

- `--dir, -d <dir-name>`

  Rename the package's directory to `./packages/<dir-name>`. To change the directory name without changing the package name, specify the current package name in both the --from and --to arguments.

Examples:

```bash
yarn tsp rename --from mr-anderson --to neo
# New package.json name = "neo"
# New package directory = "./packages/neo"

yarn tsp rename -f mr-anderson -t neo -d the-one
# New package.json name = "neo"
# New package directory = "./packages/the-one"

yarn tsp rename -f neo -t neo -d keanu
# New package.json name = "neo"
# New package directory = "./packages/keanu"
```

### `tsp add`

`tsp add --from <from-pkg> --to <to-pkg>`

Adds a dependency, so that one package in the project can import modules from another package in the project.

Arguments:

- `--from, -f <from-pkg>`

  Name of the package that will have a dependency on the `--to` package.

- `--to, -t <to-pkg>`

  Name of the package that will be depended upon by the `--from` package.

Examples:

```bash
yarn tsp add --from my-server --to my-lib
```

After adding a reference, you can import modules from the dependency. Using the example above, in a .ts file in my-server, you can now write:

```typescript
import foo from "my-lib";
```

_Note: After adding a reference from a server package (created from the `node-server` template) to another package, you will need to stop and start the server if it is running with the `dev` script. The `add` command modifies `tsconfig.json` and the `nodemon` list of watched files. The `dev` script must be stopped and restarted to pick up the changes._

### `tsp remove`

`tsp remove [--from <from-pkg>] [--all] --to <to-pkg>`

Removes a dependency.

_Note: This command does **not** delete the package directory. That is left up to you._

Arguments:

- `--from, -f <from-pkg>`

  Name of the package that will have the dependency removed.

- `--all, -a`

  Remove the dependency from all other packages in the project.

- `--to, -t <to-pkg>`

  Name of the package that will no longer be depended upon.

Examples:

```bash
yarn tsp remove --from my-server --to my-lib
# my-server no longer has a dependency on my-lib

yarn tsp remove --all --to my-lib
# All dependencies on my-lib have been removed from all packages in the project
```

### `tsp bundle <pkg-name> --out-dir <out-dir>`

_Docs coming soon..._

Meant to be run during a build process, to prepare the app for deployment. It removes anything not required to run the app, including devDependencies. Everything required to run the app is copied to `--out-dir`. 

**Set `--out-dir` to a directory outside the repo, or you risk having files overwritten!**

