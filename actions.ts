import { Message, User } from 'discord.js';
import { textDialog } from './Utils/dialog.js';
import { emojifyString } from './Utils/emojis.js';
import MessageAction from './MessageActions/MessageAction.js';
import { PrefixCommand, TypedPrefixCommand } from './Utils/actions.js';
import { arrayToString, sleep, getRandomElement } from './Utils/general.js';

const as = [
	PrefixCommand('ssemojify', { parseFully: false })
		.action(function(data) {
			this.msg.channel.send(emojifyString(data[0]), {
				split: true
			});
		}),

	new MessageAction()
		.condition(msg => msg.content.includes('daddy'))
		.action(msg => msg.react('🥵')),

	PrefixCommand('sstalk')
		.action(async function(data) {
				const path = await textDialog(this.msg.channel, this.msg.author, {
					prompt: 'prompt #0',
					responses: [
						{
							answer: 'answer 1',
							branch: {
								prompt: 'prompt #0 #0'
							}
						}, {
							answer: 'answer 2',
							branch: {
								prompt: 'prompt #0 #1'
							}
						},
					]
				}).path;

				this.msg.channel.send('Path: ' + arrayToString(path));
			}),


] as any as MessageAction<Message>[];

export default as;