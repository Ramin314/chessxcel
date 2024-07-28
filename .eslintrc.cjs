module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'import/extensions': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'consistent-return': 'off',
    'no-promise-executor-return': 'off',
    'no-restricted-globals': 'off',
    'class-methods-use-this': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', '*.config.cjs'],
};
