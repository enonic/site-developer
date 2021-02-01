module.exports = {

	// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js
	extends: 'airbnb-base',

	globals: {
		$: false,
		app: false,
		document: false,
		jQuery: false,
		log: false,
		resolve: false,
		window: false,
		__: false,
	},
	rules: { // https://eslint.org/docs/rules
		'import/extensions': ['off'],
		'import/prefer-default-export': ['off'],
		'import/no-absolute-path': ['off'],
		'import/no-extraneous-dependencies': ['off'],
		'import/no-unresolved': ['off'],
		indent: ['warn', 'tab'],
		'max-len': ['error', 100, 2, {
			ignoreUrls: true,
			ignoreComments: true,
			ignoreRegExpLiterals: true,
			ignoreStrings: true,
			ignoreTemplateLiterals: true,
		}],
		'no-multi-spaces': ['off'],
		'no-tabs': ['off'],
		'no-underscore-dangle': ['error', {
			allow: [
				'_path',
				'_id',
			],
			allowAfterThis: false,
			allowAfterSuper: false,
			enforceInMethodNames: false,
		}],
		'object-curly-spacing': ['off'],
		'spaced-comment': ['off'],
		'linebreak-style': 'windows',
	}, // rules
}; // exports
