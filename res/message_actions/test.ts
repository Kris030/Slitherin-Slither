import { PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import GuildModel from '../models/Guild.js';
import { MessageEmbed } from 'discord.js';

export default () => [
	TypedPrefixCommand('ssembed', {}, String, String, String, String,
									[{
										name: String,
										value: String,
										inline: Boolean
									}])
		.action(async function([title, description, footer, color, fields]) {
			const mbed = new MessageEmbed({
				title,
				description,
				footer: {
					text: footer,
				},
				color,
				fields
			});
			await this.reply(mbed);
		}),
];
