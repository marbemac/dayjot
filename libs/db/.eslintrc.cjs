module.exports = {
  root: true,
  extends: ['@marbelot/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
