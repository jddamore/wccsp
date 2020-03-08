module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        indent: ['error', 2, { SwitchCase: 1 }],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
        semi: ['error', 'always'],
        'no-bitwise': ['error'],
        eqeqeq: ['error'],
        'guard-for-in': ['error'],
        'wrap-iife': ['error'],
        'no-caller': ['error'],
        'no-empty': ['error'],
        'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
        'object-curly-spacing': ['error', 'always'],
        'block-scoped-var': 0,
        'no-redeclare': 0,
        'no-console': 0,
        'no-useless-escape': 0,
        'linebreak-style': 0,
        'no-prototype-builtins': 0,
        // 'promise/avoid-new': 0,
        // 'promise/no-callback-in-promise': 0,
        // 'promise/no-promise-in-callback': 0,
        'no-return-await': 2,
        "no-restricted-properties": [2, {
                "object": "describe",
                "property": "only",
                "message": "Only is not allowed in unit tests"
            },
            {
                "object": "it",
                "property": "only",
                "message": "Only is not allowed in unit tests"
            }
            ]
    }
};