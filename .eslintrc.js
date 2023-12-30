module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 15,
  },
  rules: {
    'no-console': 0,
    'no-shadow': 0,
    'no-unused-vars': ['error', { varsIgnorePattern: '_' }],
    'consistent-return': 0,
  },
};
