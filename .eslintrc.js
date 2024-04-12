module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json', tsconfigRootDir: __dirname, sourceType: 'module',
    },
    plugins: ['@stylistic/js'],
    extends: ['plugin:@typescript-eslint/recommended'],
    root: true,
    env: {
        node: true, jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        "indent": ["error", 2],
        "object-curly-spacing": ["error", "always"],
        'max-len': ['error', {code: 120}],
        'require-await': 'off',
        'no-unused-vars': 'off',
        "no-tabs": "off",
        "brace-style": ["error", "1tbs", {"allowSingleLine": true}],
        "padded-blocks": ["error", {"blocks": "never", "classes": "never", "switches": "never"}],
        "array-bracket-newline": ["error", {"multiline": true}],
        "array-element-newline": ["error", "consistent"],
        "block-spacing": "error",
        "quotes": ["error", "single", { "allowTemplateLiterals": true }]
    },
};
