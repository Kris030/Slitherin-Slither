import { TextChannel } from 'discord.js';
import { client } from '../index.js';

export function canSendMessage(channel: TextChannel) {
	const ps = channel.permissionsFor(client.user);
	return ps.has('SEND_MESSAGES') && ps.has('VIEW_CHANNEL');
}
