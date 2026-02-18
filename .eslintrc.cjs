/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", "build", "node_modules", "coverage", "*.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "import"],
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "import/no-unresolved": "off",
        "import/namespace": "off",
        "import/default": "off",
        "import/no-duplicates": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
      },
    },
  ],
};
