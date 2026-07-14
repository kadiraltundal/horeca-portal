/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'modules/**/*.service.ts',
    'modules/**/*.controller.ts',
    'config/**/*.ts',
    'common/**/*.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.strategy.ts',
    '!**/*.decorator.ts',
    '!**/*.guard.ts',
    '!main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@market-qr/database$': '<rootDir>/../../packages/database/src',
    '^@market-qr/types$': '<rootDir>/../../packages/types/src',
    '^@/(.*)$': '<rootDir>/$1',
  },
};
