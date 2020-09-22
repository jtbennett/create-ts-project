# Project structure

Running

```bash
yarn create @jtbennett/ts-project my-proj
# or: npx @jtbennett/create-ts-project my-proj
```

will create the following files in `my-proj`:

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
