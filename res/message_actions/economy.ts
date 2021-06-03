import { inGuild, PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import GuildUser from '../models/GuildUser.js';
import { Guild, User } from 'discord.js';

async function getGuildUserDocument(user: User, saveOnCreate = false) {
	const u = user.id;
	
	let e = await GuildUser.findById(u).exec();

	if (e)
		return e;

	console.log('creating new GuildUser');
	e = new GuildUser({ _id: u });

	if (saveOnCreate)
		await e.save();

	return e;
}

async function getGuildUserServerEntry(user: User, server: Guild | string, saveOnCreate = false) {
	return (await getGuildUserDocument(user)).getServer(server, saveOnCreate);
}

export default () => [
	
	TypedPrefixCommand('ssbalance', {}, User)
		.condition(inGuild)
		.action(async function([ user ]) {
			const gus = await getGuildUserServerEntry(user, this.msg.guild, true);
			await this.msg.channel.send(gus.economy.balance + '€');
		}),

	PrefixCommand('sspayday')
		.condition(inGuild)
		.action(async function() {
			const mooney = Math.floor(Math.random() * 100);

			const u = await getGuildUserDocument(this.msg.author),
				e = (await u.getServer(this.msg.guild)).economy;

			const cooldown = 1000 * 30;

			const d = e.lastPayday + cooldown - Date.now();
			if (d > 0) {
				const p = new Date(d);
				
				let pp = '';
				if (p.getUTCHours() > 0)
					pp += p.getUTCHours() + 'h ';
				if (p.getMinutes() > 0)
					pp += p.getMinutes() + 'm ';
				if (p.getSeconds() > 0)
					pp += p.getSeconds() + 's';

				if (pp === '')
					pp = 'less then a second you impatient bastard';

				this.msg.channel.send('fuck you, time left: ' + pp);
				return;
			}

			let str = e.balance + '€ -> ';

			e.balance += mooney;
			e.lastPayday = Date.now();
			u.markModified('trackedServers');

			await u.save();
			
			this.msg.channel.send(`you got ${mooney}$`);
		})
];