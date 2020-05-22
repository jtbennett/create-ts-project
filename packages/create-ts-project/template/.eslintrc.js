// This file contains all eslint rules.

// See .eslintrc.js files in each package folder and config/tsconfig.eslint.json
// for more info.

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "node", "jest"],
  extends: [
    // Core eslint recommended rules.
    "eslint:recommended",

    // Override those with TypeScript versions, where necessary.
    "plugin:@typescript-eslint/eslint-recommended",

    // Core TypeScript recommended rules - syntax only.
    "plugin:@typescript-eslint/recommended",

    // Core TypeScript recommended rules - full type checking.
    "plugin:@typescript-eslint/recommended-requiring-type-checking",

    // Disable formatting rules that prettier will handle.
    "prettier/@typescript-eslint",
  ],
  rules: {
    // Be explicit when you must, but return type is usually inferred correctly.
    "@typescript-eslint/explicit-function-return-type": "off",

    // Avoid using "any" or "as any" wherever possible, but this is too onerous.
    "@typescript-eslint/no-explicit-any": "off",

    // Avoid foo!.bar wherever possible, but this is too onerous.
    "@typescript-eslint/no-non-null-assertion": "off",

    // Clean up unused vars before committing, but this is too onerous during dev.
    "@typescript-eslint/no-unused-vars": "warn",
  },
};
