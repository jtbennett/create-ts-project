# Publishing packages to npm

There are many possible workflows for publishing. The `create-ts-project` template includes a simple setup for publishing packages from a monorepo where all published packages use the same version number.

_Note: This setup only supports the case where all packages have the same version number._

The `yarn version:all` script updates all `package.json` files and creates a git tag -- all with the same version number. The included GitHub Actions workflow is designed to publish package(s) when that tag (e.g. `v1.2.3`) is pushed to GitHub.

If you would like to follow a different workflow, you may need to modify the publishing steps in [`build.yml`](../.github/workflows/build.yml) or create your own.

## One-time setup for publishing

The [`build.yml`](../.github/workflows/build.yml) file contains commented-out tasks that can publish your packages to npm automatically when you push a new git tag to GitHub.

To automate publishing of your packages:

- [Add a secret](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) to your GitHub repo named `NPM_TOKEN` with a valid token for publishing to npm.

- Remove `"private": true` from the `package.json` files of the packages you wish to publish. Fill out other metadata fields like license, author, description, etc. (See [npm docs](https://docs.npmjs.com/configuring-npm/package-json.html) for details.)

- In [`build.yml`](../.github/workflows/build.yml):

  - Uncomment the `Publish` step.

  - Under the `Publish` step, remove "--access public" if your package will not be public.

  - Replace `__PACKAGE_NAME__` with the name of a package you want to publish. (Include the @scope, if any.)

  - Duplicate the `yarn workspace __PACKAGE_NAME__ npm publish ...` line for any additional packages you want to publish.

## Publish a new version

The package(s) will be published to npm when a tag like `v1.2.3` is pushed to github. (Where `1.2.3` is any valid npm version number.)

**The published version number will be what is in the `package.json` file. To avoid confusion, make sure that matches the tag value!**

The `version:all` [yarn script](./yarn-scripts) will do that for you:

```bash
yarn version:all 1.2.3
```

That script will:

- Set the version in package.json for all packages (including the root) to `1.2.3`.

- Commit those changes to your local copy of the repo.

- Tag the commit with `v1.2.3`.

You can then kick off a publish by pushing the tag to the `main` branch of your github repo with:

```bash
git push --follow-tags
```

If your build succeeds, the package(s) will be published to npm. You can monitor the progress of the build and publish -- and see any errors that occur -- on the Actions tab of your GitHub repo page.
