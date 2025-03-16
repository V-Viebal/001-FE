const fs = require('fs-extra');

// Copy types.d.ts file
fs.copy(
	'src/lib/types.d.ts',
	'../../dist/angular-core/lib/types.d.ts',
	(err) => {
		if (err) throw err;
		console.log(
			'\x1b[32m',
			'- Copying: types.d.ts was copied to dist/angular-core/lib/types.d.ts'
		);
	}
);

// Copy .sass-lint.yml file
fs.copyFile(
	'../../.sass-lint.yml',
	'../../dist/angular-core/.sass-lint.yml',
	(err) => {
		if (err) throw err;
		console.log(
			'\x1b[32m',
			'- Copying: .sass-lint.yml was copied to dist/angular-core/.sass-lint.yml'
		);
	}
);

// Copy tsconfig.json file
fs.copyFile(
	'../../tsconfig.json',
	'../../dist/angular-core/tsconfig.json',
	(err) => {
		if (err) throw err;
		console.log(
			'\x1b[32m',
			'- Copying: tsconfig.json was copied to dist/angular-core/tsconfig.json'
		);
	}
);

// Copy .eslintrc.json file
fs.readFile('../../.eslintrc.json', (_err, data) => {
	if (_err) throw _err;

	const output = data.toString().replace(/node_modules/g, '..');
	const file = fs.openSync('../../dist/angular-core/.eslintrc.json', 'w');

	fs.writeFile(file, output, (__err) => {
		if (__err) throw __err;

		console.log(
			'\x1b[32m',
			'- Copying: .eslintrc.json was copied to dist/angular-core/.eslintrc.json'
		);
		fs.close(file, () => {});
	});
});
