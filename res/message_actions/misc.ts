import { commandParser, inGuild, PrefixCommand, SubbedAction, TypedPrefixCommand } from '../../src/utils/actions.js';
import { guildJoined, guildLeft, handleLeftGuildDB, handleJoinedGuildDB } from '../clientEvents.js';
import { arrayToString, random, randomInt } from '../../src/utils/general.js';
import { ParseableTypes, parseType } from '../../src/utils/parsing.js';
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

		PrefixCommand('ssmemes')
			.condition(inGuild)
			.action(SubbedAction({
				async get([ key ]) {
					const g = await GuildModel.findById(this.guild.id);

					this.reply(g.store.has(key) ?
								g.store.get(key) :
								`property doesn't exist`
					);
				}, async set([ key, ...others]) {
					const g = await GuildModel.findById(this.guild.id);
					let value = others.reduce((p, c) => p + ' ' + c);

					g.store.set(key, value);
					await g.save();

					this.reply('Set it.');
				}, async list() {
					const g = await GuildModel.findById(this.guild.id);
					let m = '';
					for (const entry of g.store.entries())
						m += entry[0] + `: ${entry[1]}\n`;
					
					this.reply(m ? m : 'nothing here...');
				}
			})),
		
		TypedPrefixCommand('ssrejoin', { parseCount: 0 }, Boolean)
			.condition(inGuild)
			.action(async function([ notJustDB ]) {
				if (notJustDB) {
					await guildLeft(this.guild);
					await guildJoined(this.guild);
				} else {
					await handleLeftGuildDB(this.guild.id);
					await handleJoinedGuildDB(this.guild);
				}
				this.reply('did it.');
			}),

		/*PrefixCommand('ssconfig')
			.condition(inGuild)
			.action(SubbedAction({
				async get([ key ]) {
					const g = await GuildModel.findById(this.guild.id);
					this.reply(key in g.config.system ? g.config.system[key] : `property doesn't exist`);
				}, async set([ key, ...others]) {
					const g = await GuildModel.findById(this.guild.id);
					let value = others.reduce((p, c) => p + ' ' + c);

					if (!(key in g.config.system))
						return void this.reply(`property doesn't exist`);

					g.config.system[key] = value;
					await g.save();

					this.reply('Set it.');
				}, async list() {
					const g = await GuildModel.findById(this.guild.id);
					let m = '';
					for (const entry of Object.entries(g.config.system))
						m += entry[0] + `: ${entry[1]}\n`;
					
					this.reply(m ? m : 'nothing here...');
				}
			})),*/
];
