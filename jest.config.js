/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.type.ts',
    '!src/**/swagger.ts',
    '!src/**/swagger.json'
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  setupFiles: ['<rootDir>/test/setup.js'],
};