module.exports = {
  root: true,
  extends: ['plugin:tailwindcss/recommended', '@supastack/eslint-config'],

  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
