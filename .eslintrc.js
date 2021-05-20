module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "semi": ["error", "always"],
    "brace-style": ["error", "stroustrup"],
    "comma-dangle": ["error", "never"],
    "no-unused-vars": ["warn"],
    "no-var": ["off"],
    "one-var": ["off"],
    "no-console": "off"
  }
};
