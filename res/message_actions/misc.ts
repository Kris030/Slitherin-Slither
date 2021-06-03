import { inGuild, PrefixCommand, SubbedAction, TypedPrefixCommand } from '../../src/utils/actions.js';
import { ParseableTypes, parseType } from '../../src/utils/parsing.js';
import { arrayToString } from '../../src/utils/general.js';

const configs = new Map<string, string>();
export default () => [

	PrefixCommand('ssbounce')
		.action(function(args) {
			this.reply(arrayToString(args))
		}),

	PrefixCommand('ssparse')
		.action(async function(args) {
			if (args.length % 2 != 0)
				return void this.reply('args % 2 != 0');

			const pArgs = new Array(args.length / 2);

			for (let i = 0; i < args.length; i += 2) {
				try {
					pArgs[i / 2] = await parseType(args[i + 1],
						ParseableTypes.find(t =>
							t.prototype.constructor.name.toLowerCase() ==
							args[i].toLowerCase()));
				} catch (e) {
					pArgs[i / 2] = `Couldn't parse`;
				}
			}

			this.reply(arrayToString(pArgs));
		}),

	TypedPrefixCommand('ssrand', {}, Number, Number, Boolean)
		.action(function([min, max, round]) {
			
			let n = Math.random() * max + min;
			if (!round)
				n = Math.round(n);

			this.reply('Your number: ' + n);
		}),

	PrefixCommand('ssconfig')
		.condition(inGuild)
		.action(SubbedAction({
			get([ prop ]) {
				this.reply(prop + ': ' + configs.get(prop));
			}, set([ prop, ...others]) {
				let s = others.reduce((p, c) => p + '\n' + c);
				configs.set(prop, s);
				this.reply(`Set ${prop} to ` + s);
			}, list() {
				let m = '';
				for (const entry of configs.entries())
					m += entry[0] + `: ${entry[1]}\n`;
				
				this.reply(m ? m : 'nothing here...');
			}
		})),
];