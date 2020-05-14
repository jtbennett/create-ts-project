// This config is used by all packages except create-react-app web apps.
// The `test` script in each package calls:
//    jest
//      --config ../jest.config.js    # This file.
//      --rootDir <packageDir>`        # Limits to tests in that one package.
//
// A package can opt-out of this shared config by not referencing it

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  setupFiles: ["<rootDir>/src/jest/createMocks.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/jest/addMatchers.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  moduleNameMapper: {
    "^@jtbennett/([^/]*)$": "<rootDir>/../$1/src",
    "^@jtbennett/([^/]*)/(.*)$": "<rootDir>/../$1/src/$2",
  },
};
