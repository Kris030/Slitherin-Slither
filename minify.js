import { opendir, writeFile, readFile } from 'fs/promises';
import minify from 'minify';

async function traverseDirectory(dir, action) {
	const d = await opendir(dir);
	let f;
	while (f = await d.read()) {
		const fullname = dir + '/' + f.name;
		if (f.isDirectory()) {
			await traverseDirectory(fullname, action);
		} else if (f.isFile())
			await action(fullname);
	}
}

traverseDirectory('out', async f => {

	const m = [
		{
			exts: ['html', 'css', 'js'],
			handler: minify
		},
		{
			ext: 'json',
			handler: async f => JSON.stringify(JSON.parse(await readFile(f)))
		}
	];


	try {
		for (const type of m) {
			if (!(f.endsWith('.' + type.ext) || type.exts?.some(e => f.endsWith('.' + e))))
				continue;
			
			console.log(`Minifying ${f}`);
			const res = await type.handler(f);
			await writeFile(f, res);
			break;
		}
	} catch (error) {
		console.log('Error while minifing')
		console.error(error);
	}
});
