module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
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
