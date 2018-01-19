module.exports = {

    // https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js
    extends: 'airbnb-base',

    globals: {
      app: false,
      log: false,
      resolve: false,
      __: false
    },
    rules: { // https://eslint.org/docs/rules
        'comma-dangle': ['error', {
            arrays: 'ignore',
            objects: 'never',
            imports: 'never',
            exports: 'never',
            functions: 'ignore'
        }],
        'import/extensions': ['off'],
        'import/prefer-default-export': ['off'],
        'import/no-absolute-path': ['off'],
        'import/no-extraneous-dependencies': ['off'],
        'import/no-unresolved': ['off'],
        indent: ['error', 4],
        'max-len': ['error', 100, 2, {
            ignoreUrls: true,
            ignoreComments: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }],
        'no-multi-spaces': ['off'],
        'no-underscore-dangle': ['error', {
            allow: [
                '_path',
                '_id'
            ],
            allowAfterThis: false,
            allowAfterSuper: false,
            enforceInMethodNames: false,
        }],
        'object-curly-spacing': ['off'],
        'spaced-comment': ['off']
    } // rules
}; // exports
