# Publishing packages to npm

## One-time setup for publishing

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

## Publish a new version

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

