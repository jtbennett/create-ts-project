# Create TypeScript Project ![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=main)

Create TypeScript monorepo projects with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html), [jest](https://jestjs.io/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/); an automated lint/test/build on every push to GitHub; and an (optional) automated publish to npm on every push of a version tag to GitHub.

**The short version: It's like Create React App for TypeScript monorepos, with scripts for CI and package publishing thrown in.**

If you have questions or something doesn't "just work", feel free to [submit an issue](https://github.com/jtbennett/create-ts-project/issues/new). You can find me on Twitter [@jtbennett](https://twitter.com/jtbennett).

## Contents

In this file:

- [Quickstart](#quickstart)

- [Why?](#why)

- [Getting started](#getting-started)

- [Philosophy](#philosophy)

- [Tools included](#tools-included)

- [Alternatives](#alternatives)

- [License](#license)

Additional documentation:

- [Yarn scripts](./docs/yarn-scripts.md). What each of the included scripts does.

- [`tsp` commands](./docs/tsp-commands.md). Details on all `tsp` commands.

- [Publishing to npm](./docs/publishing-to-npm.md). How to configure the GitHub workflow to publish when you push a new tag to GitHub.

- [Configuration](./docs/configuration.md). How the various config files work.

- [Contributing](./CONTRIBUTING.md)

## Quickstart

- Install [node >=12.0](https://nodejs.org). (_node 10.x and 11.x will work, but require a couple of tweaks._)

- Install [yarn >=1.12, <2.0](https://classic.yarnpkg.com) globally (`npm install -g yarn`).

To create a new project, open a terminal and run:

```bash
yarn create @jtbennett/ts-project my-proj
# or: npx @jtbennett/create-ts-project my-proj
cd my-proj
```

You now have a TypeScript monorepo ready for development, with TypeScript project references and yarn v2 workspaces.

Open `my-proj` in VS Code or your editor of choice. All the files you see are configured so that yarn, TypeScript, Jest, ESLint and Prettier will work correctly. You can leave them all as-is.

Your code will go in the `./packages` directory.

### About `tsp`

A command line tool called `tsp` is included as a `devDependency` in the root `package.json` file. Use `tsp` to create new packages and to add/remove dependencies between packages in the project. (This is similar to how `react-scripts` is a `devDependency` when you run `create-react-app`.)

You don't have to use `tsp`, but it makes things easier. When you add/remove dependencies between packages in the project, it will update `package.json` and `tsconfig` files so that everything continues to work correctly.

For a simple walk-through with more explanation, see [Using `tsp`](#using-tsp) below.

For detailed information on all `tsp` commands, see [`tsp` commands](./docs/tsp-commands.md)

Example commands to create two packages and a dependency between them.

```bash
# Create the packages in ./packages:
yarn tsp create my-lib --template node-lib
yarn tsp create my-server -t node-server

# Add the dependency:
cd ./packages/my-server
yarn tsp add my-lib

# Run the server:
yarn dev
# The server is running at http://localhost:3000
```

You can now import modules form `my-lib` into `my-server`:

```typescript
import foo from "my-lib";
console.log(foo);
```

### Other useful yarn scripts

The root `package.json` file includes other scripts you can use. (See [Yarn scripts](#yarn-scripts) for more details.)

```bash
# Scripts that operate on all packages in the project:
yarn lint:all
yarn test:all
yarn build:all
yarn clean:all

# Lint, test, clean and build all packages - useful before committing to git!
yarn verify:all

# Run a script for a single package:
yarn workspace my-lib test
yarn workspace my-lib build

# The node-server and create-react-app templates
# have a script to start a development server:
yarn workspace my-server dev
yarn workspace my-react-app dev

# Set your working directory to a specific package to shorten the commands:
cd ./packages/my-server
yarn dev
```

## Why?

**_A monorepo..._**

A lot of my work is building APIs and web apps, often with NodeJS and React and in TypeScript. It's common to have both the NodeJS web server and the React client app in the same project.

I also tend to split larger apps into separate packages -- both to organize the code and to keep me honest about the architecture. That's true even when I don't plan to publish anything to npm.

As a result, these projects are usually monorepos -- multiple packages/apps in the same repo.

**_...plus a lot of interdependent tools..._**

A typical project involves configuring TypeScript, jest, eslint, prettier, nodemon, Docker, VS Code, a CI process (e.g., GitHub Actions, CircleCI, TravisCI, Jenkins), deployments to Heroku or AWS or Azure or Google Cloud, and sometimes publishing to npm.

**_...involves a lot of configuration effort..._**

Separately, each of those tools is straightforward to use.

Getting them all working together in harmony takes effort. For example, we want Jest to be able to find and run our tests, but we don't want test-related files in our build output that will be deployed or published.

Doing that in a monorepo is more effort. TypeScript, yarn and jest all use different approaches to resolving packages within the repo.

And keeping them working consistently for all members of a team -- even more effort. For example, does that one person whose linter is using different rules keep breaking the build? Or do semicolons and whitespace make your diffs more difficult to read?

**_...and ongoing hassle..._**

Adding a dependency between two packages in a monorepo sounds simple: run the yarn or npm or lerna command and you're done.

But are you?

- Does your dev server restart when a file in one of its dependencies changes?

- Does your editor know how to resolve TypeScript types so it can highlight errors, offer code completion and navigate source code across packages with "Go to definition (F12)"?

- Do the eslint rules that check TypeScript types work across dependencies?

- Can Jest resolve the dependencies when you run tests?

- When built for deployment, can the transpiled .js files be resolved by node?

**_...which keeps you from focusing on the actual product._**

I'd like everyone on the team to have all that "just work", so we can focus on the actual thing we're trying to build. That's the goal for Create Typescript Project.

## Getting started

### Create a project

_It is not recommended to install the `create-ts-project` package. Instead, use `yarn create` or `npx` to run it as a command._

Prerequisites:

- Install [node >=12.0](https://nodejs.org). (_node 10.x and 11.x will work, but require a couple of tweaks._)

- Install [yarn >=1.12, <2.0](https://classic.yarnpkg.com) globally (`npm install -g yarn`).

To create a new project, open a terminal and run:

```bash
yarn create @jtbennett/ts-project my-proj
# or: npx @jtbennett/create-ts-project my-proj
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
├── packages   <----- Your code goes here.
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

### Using `tsp`

_For detailed information on all `tsp` commands, see [`tsp` commands](./docs/tsp-commands.md)._

`tsp` -- the `ts-project-scripts` CLI -- was installed as a devDependency when you ran the create command above.

`tsp` is used to create packages, which is really just copying a template into the `packages` folder. More importantly, it is used to manage dependencies between packages within the project. It updates the various config files so all the tools work as intended.

A "package" can be a web server, a React app, a command-line tool, a standalone library -- pretty much anything written in TypeScript that has a `package.json` file and a `tsconfig.json` file.

`tsp` includes some templates, and it's easy to create your own templates. Each template contains the scripts, config files, and file structure needed to plug into the rest of the project.

Let's walk through some of the same commands in the [Quickstart](#Quickstart), but with more explanation along the way.

#### Create a node library package

This will contain modules that we'll import into other packages.

```bash
yarn tsp create my-lib --template node-lib
```

This will create a directory `./packages/my-lib` that looks like this:

```
my-lib
├── src
│   ├── index.test.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

`index.ts` has a default export - a string.

#### Create a node server

Create a node server package. This time we'll use the `-t` short version of `--template`.

```bash
yarn tsp create my-server -t node-server
```

The package is created at: `./packages/my-server`. It contains a very similar structure as the library package, but the scripts in `package.json` are a little different. They include a `dev` script to run the server with nodemon watching for changes.

```bash
yarn workspace my-server dev
```

You'll see some messages from `tsc` and `nodemon`, and the "hello world" output. The server is a basic [express](https://expressjs.com) server. You can open your browser to [http://localhost:3000](http://localhost:3000) to see the same message.

If you save a change to `./packages/my-server/src/index.ts`, you'll see the server restart.

_You don't have to use express to use this template. Delete the dependency on express and use whatever web server framework you like. The `dev` script and other configuration is what makes this template suitable for server apps._

#### Add a dependency between packages

Now let's consume my-lib from my-server.

This is the conceptual equivalent of running `yarn add` or manually adding a dependency in `package.json`. We'll use `tsp` instead. It updates not only the dependency in `package.json`, but also the nodemon, jest and TypeScript config values.

To add the dependency:

```bash
# Stop my-server with Ctrl-C.

# Add the reference.
yarn tsp workspace my-server add my-lib

# Restart the server.
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

#### Remove a dependency between packages

This is the conceptual equivalent of running `yarn remove` or manually removing a dependency in `package.json`. Again, `tsp` does that for you, as well as making corresponding changes to nodemon, jest and TypeScript configs.

```bash
# Stop my-server with Ctrl-C.

# Remove the reference.
yarn workspace my-server tsp remove my-lib

# Restart the server.
yarn workspace my-server dev
```

You might expect to see an error when the server runs, because `my-server` still contains an import from `my-lib`.

_Unfortunately, you won't actually see an error._ Because of the symlinks created by yarn workspaces, `my-server` can still resolve `my-lib`. The good news is that ESLint knows that you no longer have the dependency in `package.json` and will highlighting the problem in your editor. The linter will also generate an error when it is run at the command line.

#### Cleaning up

You can stop the dev server (`Ctrl-C`) and completely delete the `my-server` and `my-lib` directories. You will need to rerun `yarn` after deleting them, so that it knows that those workspaces no longer exist.

`tsp` does not make changes outside of the individual package directories, and never deletes files or directories.

Now you can start adding your actual packages. Enjoy!

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

The [RomeJS](https://romefrontend.dev/) and [Deno](https://deno.land/) projects are also addressing some of the same pain points. They each take the approach of building their own integrated set of tools: TypeScript compiler, linter, formatter, bundler, etc. I'm looking forward to using them, but they are each in the early stages of development.

## License

Create TypeScript Project is licensed under the [MIT license](./LICENSE).

[License notices](./docs/licenses.md) for third-party software used in this project.
