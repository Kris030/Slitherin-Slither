import GuildUser, { GuildUserType } from '../models/GuildUser.js';
import { TypedPrefixCommand } from '../../src/utils/actions.js';
import { User } from 'discord.js';

export default () => [
	TypedPrefixCommand('ssbalance', {}, User)
		.action(async function([ user ]) {
			const document = await GuildUser.findById(user.id).exec();
			this.msg.channel.send(document.economy.balance.toString());
		})
];