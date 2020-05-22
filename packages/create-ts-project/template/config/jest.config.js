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

  // These files run before anything else.
  // Typically used to create mocks used in all test files.
  setupFiles: ["<rootDir>/src/jest/createMocks.ts"],

  // These files run after the Jest environment is ready.
  // If you have custom matchers or other global setup, do it here.
  setupFilesAfterEnv: ["<rootDir>/src/jest/addMatchers.ts"],

  // Test files must match this pattern.
  testMatch: ["<rootDir>/src/**/*.test.ts"],

  // Jest needs help finding modules in referenced packages.
  // TODO: "tsp ref" and "tsp unref" manage these values for you.
  moduleNameMapper: {},
};
