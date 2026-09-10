import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
    {
        ignores: [".*/**", "bin-dev/**", "bin/**", "node_modules/**", "eslint.config.mjs"],
    },
    eslint.configs.recommended,
    ...tseslint.configs["flat/recommended-type-checked"],
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: true,
                ecmaVersion: "latest",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
            },
            globals: globals.browser,
        },
        rules: {
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "require-yield": "off",
        },
    },
    prettier,
];
