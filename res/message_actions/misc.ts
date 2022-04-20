import { commandParser, PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import { arrayToString, random, randomInt } from '../../src/utils/general.js';
import { ParseableTypes, parseType } from '../../src/utils/parsing.js';

export default () => [

	PrefixCommand('ssbounce')
		.action(function(args) {
			this.reply(arrayToString(args))
		}),

	TypedPrefixCommand('ssbouncex', { parseCount: 1 }, Number, String)
		.action(function([parseCount, rest]) {
			this.reply(arrayToString(commandParser({ parseCount })(rest)));
		}),

	PrefixCommand('ssparse')
		.action(async function(args) {
			if (args.length % 2 != 0) {
				this.reply('args % 2 != 0');
				return;
			}

			const pArgs = new Array(args.length / 2);

			for (let i = 0; i < args.length; i += 2) {
				try {
					pArgs[i / 2] = await parseType(args[i + 1],
						ParseableTypes.find(t =>
							t.prototype.constructor.name.toLowerCase() == args[i].toLowerCase()
						)
					);
				} catch {
					pArgs[i / 2] = `Couldn't parse`;
				}
			}

			this.reply(arrayToString(pArgs));
		}),

	TypedPrefixCommand('ssrand', {}, Number, Number, Boolean)
		.action(function([min, max, round]) {
			this.reply('Your number: ' + round ? randomInt(min, max) : random(min, max));
		}),
];
