module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['./src/**/*.{ts,js}', '!**/node_modules/**'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  // ...setupFiles,
  reporters: [
    'default',
    // [
    //   'jest-junit',
    //   {
    //     suiteName: 'jest tests',
    //     outputDirectory: 'tests',
    //   },
    // ],
  ],
};
