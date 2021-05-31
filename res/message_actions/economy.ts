import GuildUser, { GuildUserType } from '../models/GuildUser.js';
import { PrefixCommand, SubbedCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import { User } from 'discord.js';

export default () => [
	
	TypedPrefixCommand('ssbalance', {}, User)
		.action(async function([ user ]) {
			try {
				const document = await GuildUser.findById(user.id).exec();
				
				this.msg.channel.send(document ? document.economy.balance.toString() + '$' : 'use `sseconomy join` to use my economy system fag');
			} catch (error) {
				console.error(error);
			}
		}),
	
	SubbedCommand('sseconomy', {
		'join': async function() {
			const u = this.msg.author.id;

			if (await GuildUser.findById(u).exec())
				return void this.msg.channel.send('fuck you, already in');
			
			await GuildUser.create({
				_id: u,
				economy: {
					balance: 0,
					lastpayday: 0
				}
			});

			this.msg.channel.send('well shit, wellcum to the club');
		}
	}),

	PrefixCommand('sspayday')
		.action(async function() {
			const mooney = Math.floor(Math.random() * 100);

			const u = await GuildUser.findById(this.msg.author.id).exec();
			if (!u)
				return void this.msg.channel.send('use `sseconomy join` to use my economy system fag');

			try {

				const cooldown = 1000 * 30;

				const d = u.economy.lastPayday + cooldown - Date.now();
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

					this.msg.channel.send('fuck you, ' + pp + ' left until next payday');
					return;
				}
			} catch (err) {
				console.error(err);
			}

			u.economy.balance += mooney;
			u.economy.lastPayday = Date.now();
			await u.save();
			
			this.msg.channel.send(`you got ${mooney}$`);
		})
];