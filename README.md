# @jtbennett/create-ts-project

_For detailed information, [see the documentation](./docs/README.md)._

![Build](https://github.com/jtbennett/create-ts-project/workflows/Build/badge.svg?branch=master)

## Intro

This is a template monorepo for Typescript-based projects, including node-based apps, front-tend apps created with create-react-app or nextjs, or packages intended for publishing on npm.

The goal is to be able to generate a new repo from this template and immediately start working -- without spending any time setting up tools.

Although it is structured as a monorepo, the template may be useful even if you never publish packages. I tend to organize code in multiple packages even when I'm only consuming those packages from a single private application.

The more of the tools listed below that you use, the more useful this template may be, but most are easily removed or replaced. That said, it probably makes little sense to use this template if you aren't primarily using Typescript.

## Tools used

For development:

- typescript - language, uses project references.
- jest - testing.
- eslint - linting.
- yarn - package management and running scripts.
- ts-node - running node-based apps written in typescript without compiling.
- prettier - code formatting.
- Docker - running dev-time dependencies like databases.
- VS Code - code editor.

For continuous integration (CI):

- github actions - running continuous integration (CI) and deploying on each commit.
- github packages - hosting docker images
- Docker - output of build process is a Docker image.

## Setting up for development of create-ts-project

You must be running `node v12.x` or later and have `yarn v1.12` or later installed globally.

**One-time setup:**

```bash
# Clone the repo.
git clone https://github.com/jtbennett/create-ts-project.git
cd create-ts-project

# Install packages from npm.
yarn
```

## License

Create Typescript Project is licensed under the [MIT license](./LICENSE).
