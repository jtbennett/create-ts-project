# Configuration details

This document describes how each of the tools used in Create TypeScript Project is configured, and how `tsp` commands update those configurations.

All paths are relative to the project/repo root, unless stated otherwise.

_Remember: There is no magic. `tsp` only makes changes to standard `tsconfig.json` and `package.json` files._

## VS Code

The `./.vscode/settings.json` file tells VS Code to:

- Use Prettier for code formatting.
- Format files on save.
- Use 2 spaces for indenting.
- Use the version of TypeScript installed to `node_modules/typescript/lib` by the `devDependency` in the root `package.json`. This prevents developers from inadvertently using different versions of TypeScript, as included in different versions of VS Code.

The `./.vscode/extensions.json` file tells VS Code to recommend the following extensions when the project is opened:

- ESLint
- Prettier

If your team would benefit from common use of other VS Code extensions, you may want to add them to that file. May I suggest:

- Better Comments (aaron-bond.better-comments)
- Bracket Pair Colorizer 2 (coenraads.bracket-pair-colorizer-2)
- Code Spell Checker (streetsidesoftware.code-spell-checker)
- Docker (ms-azuretools.vscode-docker)
- DotENV (mikestead.dotenv)
- GitHub Pull Requests and Issues (github.vscode-pull-request-github)
- GitLens (eamodio.gitlens)
- JavaScript (ES6) code snippets (xabikos.javascriptsnippets)
- Jest Test Explorer (kavod-io.vscode-jest-test-adapter)
  - Requires: Text Explorer UI (hbenl.vscode-test-explorer)
- Live Share (ms-vsliveshare.vsliveshare)
- Peacock (johnpapa.vscode-peacock)

## Yarn

_For info about the scripts included in the root and package template `package.json` files, see [Yarn scripts](./yarn-scripts.md)._

Yarn workspaces are configured in the root `package.json` with:

```json
{
  "workspaces": {
    "packages": ["packages/*"]
  }
}
```

The wildcard means that each immediate subdirectory of `./packages` is a workspace. In other words, each package directory is a workspace. `tsp` adds new packages inside the `./packages` directory and reruns `yarn` after each command to set up the symlinks described below.

Yarn workspaces does the following:

- Creates a symlink in the root `./node_modules` for each of your workspaces that points to the the actual directory under `./packages`. That is:

  ```
  ./node_modules/my-package -> ./packages/my-package
  ```

  This is the important part of workspaces. Using the normal module resolution algorithm (roughly: look in my `node_modules`, then in `node_modules` of each of my parent directories, until you find a match), this means that your packages are resolvable at runtime in your dev environment.

  Say that pkg-a references pkg-b. At runtime, when you `import foo from 'pkg-b'`, node will look in:

  - `./packages/pkg-a/node_modules/pkg-b` - Not found.
  - `./packages/node_modules/pkg-b` - Not found.
  - `./node_modules/pkg-b` - Success! Thanks to the symlink.

  _Note 1: TypeScript resolution works differently, using project references and the `paths` option. See [TypeScript config](#typescript) for more info._

  _Note 2: See [ts_node](#ts-node) for why we need the symlink at runtime._

- Handles dependencies on local workspaces. When it sees a package name in `dependencies` or `devDependencies` that matches the package name of a workspace (not necessarily the same as the directory name), yarn knows that at runtime, the symlinks it created (see previous bullet) will allow the dependency to be resolved correctly.

- "Hoists" packages to the root `./node_modules` whenever possible. That is, the dependencies for all of your packages will be in `./node_modules`. The only dependencies that will be in a `node_modules` directory inside one of your packages is if that package requires a different version than other packages. This can save disk space if you have multiple packages with common dependencies.

See [workspaces](https://classic.yarnpkg.com/en/docs/workspaces) in the `yarn` documentation for more info.

## Publishing to npm

The root `package.json` file should not be published. It contains `private: true` to prevent accidental publishing and omits `description`, `bin`, `main`, `types`, `license` and other properties that would likely be set in a published package.

On the other hand, the `package.json` in each package template anticipates that you may want to publish the package. Specifically, it has the following values:

_(Standard json cannot include comments. The descriptive comments below must be removed if you copy this into an actual `package.json` file.)_

```js
{
  // To prevent unintended publishing to npm. Must be removed to publish.
  "private": true,

  // Metadata that should be filled in for public packages.
  "description": "",
  "keywords": [],
  "author": "",
  "license": "unlicensed",

  // Consider removing this if the package is intended to run in the browser.
  "engines": {
    "node": ">=12.0.0"
  },

  // "lib" is the outDir value in the package's tsconfig.json.

  // Tell other packages where to look when importing modules.
  "main": "lib/index.js",

  // Tell TypeScript where to look for types.
  // (Not used for local dev. This is for others who install your package.)
  "types": "lib/index.d.ts",

  // Tell npm which files to include in the package when packing or publishing.
  "files": ["lib/**/*"],

  // [In the CLI template only.]
  // Tell npm/yarn the name and target path to use when creating a symlink in
  // node_modules/.bin, as well as the CLI entry point file.
  // (Primarily used by others who install your package.)
  "bin": {
    "node-cli": "./lib/index.js"
  }
}
```

## TypeScript

Each package template contains a `tsconfig.json` file that governs how `tsc` transpiles the file. See the [tsconfig.json documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for more info. Those package-level files all "extend" a shared file located at [`./config/tsconfig.node.json`](../config/tsconfig.node.json).

The shared file contains all `compilerOptions` settings, including the "strictness" rules. That is where you would globally modify those options. [The shared `tsconfig.json` file](../config/tsconfig.node.json) is well commented. See it for more info on the specific settings. The included `compilerOptions` are very strict. It is easy to disable specific rules that bother you in that file.

The package-level files contain _only paths_. Most of these paths are identical in all templates/packages, but they must be duplicated in each individual package directory. `tsc` does not offer a way to share paths that are relative to each package's individual `tsconfig.json` file. Some paths work this way, some don't. For consistency and to avoid confusion, we place all paths in the package-level file.

You can, if you wish, add other `compilerOptions` to the package-level files. Any options you add at the package-level will override the corresponding setting the in shared file.

You can also completely opt out of the shared settings for a single package by removing the `extends` property or extending some other file. This is how, for example, create-react-app apps work within a create-ts-project monorepo. The CRA TypeScript template includes a `tsconfig.json` file that has different settings, such as including "dom" types rather than "node" types.

A TypeScript project reference is specified in the `tsconfig.json` of the referencing (dependent) package. The reference points to the `tsconfig.json` file of the referenced (depended upon) package.

For an editor like VS Code to be able to resolve types -- in order to provide intellisense, linting, etc. -- we also need include a value in `compilerOptions.paths` for each referenced package.

`tsp ref` and `tsp unref` manage these changes to `tsconfig.json` for you.

See the [project references documentation](https://www.typescriptlang.org/docs/handbook/project-references.html) for more info.

## nodemon

The `dev` script in a package created from the node-server template runs `nodemon`. It's configuration is in the `nodemonConfig` property of that package's `package.json`.

The initial config looks like this:

```json
{
  "nodemonConfig": {
    "exec": "ts-node ./src/index.ts --files",
    "ext": "ts,json",
    "ignore": ["./src/jest", "./src/**/*.test.ts", "./src/**/__mocks__"],
    "watch": [
      ".env",
      "./src",
      "./tsconfig.json",
      "../../config/tsconfig.node.json"
    ]
  }
}
```

`tsp ref` and `tsp unref` modify the `watch` value for you, so that a change to a source file in a dependency will cause the server to restart.

## ts-node

`ts-node` does not require any configuration. The configurations of `yarn workspaces`, `tsc` and `nodemon` (which are managed for you by `tsp`) ensure that `ts-node` can resolve types and modules at runtime.

`ts-node` [does not support](https://github.com/TypeStrong/ts-node/issues/897) TypeScript project references. This is the "limitation" referred to in multiple places in this documentation. For this reason:

- We need the symlinks to referenced packages created by yarn workspaces in order for those dependencies to be resolvable at runtime.

- We need to build with `tsc --build` before running `ts-node` and to run `tsc --build --watch` in parallel with `nodemon` for server packages.

If and when a future version of `ts-node` supports project references,

`ts-node` is not used at runtime in a deployed app -- only during development.

## jest

_Docs coming soon..._

ts-jest plugin
tsconfig that includes test files
moduleNameMapper required for deep imports

## eslint

_Docs coming soon..._

./config
plugins
.eslintrc.js in each package folder (can't avoid this noise)
to set working directories for vscode

Limitations: have to build first, which is why linting is last in `yarn verify` scripts.

## prettier

The point of prettier is to avoid arguments over arbitrary formatting. We all have personal preferences, but lets all just use the prettier defaults and get on with our work, shall we? :wink:

There is one exception that I think is valid, because it has a productivity impact -- it isn't just formatting.

I use the setting `trailingCommas: "all"`. I often find myself reordering property values in an object or parameters to a function. With this setting prettier adds a comma after the last property/parameter when they are each on a separate line. So there is no need to add or remove a comma when reordering.

All that said, you'll find the prettier config in the `prettier` property of the root `package.json` file. Prettier is also installed as a devDependency in that file, so it is available to VS Code and the command line.
