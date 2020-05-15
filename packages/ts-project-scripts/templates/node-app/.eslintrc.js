// This file instructs @typescript-eslint/parser where to find the tsconfig.json
// file for the package.

// See .eslintrc.js in the repo root for linting rules.
// See config/tsconfig.eslint.json for additional info.

module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "../../config/tsconfig.eslint.json"],
  },
};
