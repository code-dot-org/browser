module.exports = {
    extends: "standard",
    env: {
      node: true,
    },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
  }
};