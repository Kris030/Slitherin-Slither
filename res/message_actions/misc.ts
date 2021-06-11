import { commandParser, inGuild, PrefixCommand, SubbedAction, TypedPrefixCommand } from '../../src/utils/actions.js';
import { ParseableTypes, parseType } from '../../src/utils/parsing.js';
import { arrayToString } from '../../src/utils/general.js';
import GuildModel from '../models/Guild.js';

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
			async get([ key ]) {
				const g = await GuildModel.findById(this.guild.id);
				const val = g.config.custom.get(key);

				this.reply(val ? val : `property doesn't exist`);
			}, async set([ key, ...others]) {
				const g = await GuildModel.findById(this.guild.id);
				let value = others.reduce((p, c) => p + '\n' + c);

				g.config.custom.set(key, value);
				await g.save();

				this.reply('Set it.');
			}, async list() {
				const g = await GuildModel.findById(this.guild.id);
				let m = '';
				for (const entry of g.config.custom.entries())
					m += entry[0] + `: ${entry[1]}\n`;
				
				this.reply(m ? m : 'nothing here...');
			}
		})),
];
