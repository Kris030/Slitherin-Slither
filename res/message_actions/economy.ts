import { inGuild, PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import { dateToString } from '../../src/utils/general.js';
import GuildUser from '../models/GuildUser.js';
import { Guild, User } from 'discord.js';

async function getGuildUserDocument(user: User, saveOnCreate = false) {
	const u = user.id;
	
	let e = await GuildUser.findById(u).exec();

	if (e)
		return e;

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
		.condition(inGuild())
		.action(async function([ user ]) {
			const gus = await getGuildUserServerEntry(user, this.guild, true);
			await this.reply(gus.economy.balance + '€');
		}),

	PrefixCommand('sspayday')
		.condition(inGuild())
		.action(async function() {
			const mooney = Math.floor(Math.random() * 100);

			const u = await getGuildUserDocument(this.author),
				e = (await u.getServer(this.guild)).economy;

			const cooldown = 1000 * 30;

			const d = e.lastPayday + cooldown - Date.now();
			if (d > 0) {
				this.reply('fuck you, time left: ' + dateToString(d, 'less then a second you impatient bastard'));
				return;
			}

			e.balance += mooney;
			e.lastPayday = Date.now();
			u.markModified('trackedServers');

			await u.save();
			
			this.reply(`you got ${mooney}$`);
		}),

	TypedPrefixCommand('ssbribe', {}, Number, User)
		.condition(inGuild())
		.action(async function([ amount, to ]) {

			if (this.author == to) {
				this.reply('you stoned?');
				return;
			}

			const u = await getGuildUserDocument(this.author),
				  e = (await u.getServer(this.msg.guild)).economy;

			if (e.balance < amount) {
				this.reply(`fuck you don't have enough mooney`);
				return;
			}

			const u2 = await getGuildUserDocument(to),
				  e2 = (await u2.getServer(this.msg.guild)).economy;

			e.balance -= amount;
			e2.balance += amount;

			u.markModified('trackedServers');
			u2.markModified('trackedServers');

			await Promise.all([u.save(), u2.save()]);

			this.reply('transfer succesful');
		})
];
