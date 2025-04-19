import { globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import pluginReactJSXRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	pluginReactConfig,
	pluginReactJSXRuntime,
	eslintConfigPrettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},			
		},
	},
	{
		plugins: {
			'@stylistic/ts': stylisticTs,
		},
		rules: {
			'no-unused-vars': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@stylistic/ts/quotes': ['error', 'single'],
		},
	},
	{
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	globalIgnores([
		'renderer/out/**/*',
		'renderer/.next/**/*',
		'**/*.js',
	]),
);
