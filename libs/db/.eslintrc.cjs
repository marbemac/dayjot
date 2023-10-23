module.exports = {
  root: true,
  extends: ['@supastack/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
