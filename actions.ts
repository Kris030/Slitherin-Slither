import { Message, User } from 'discord.js';
import { textDialog } from './Utils/dialog.js';
import { emojifyString } from './Utils/emojis.js';
import MessageAction from './MessageActions/MessageAction.js';
import { PrefixCommand, TypedPrefixCommand } from './Utils/actions.js';
import { arrayToString, sleep, getRandomElement } from './Utils/general.js';

export const createActions = () => [
	PrefixCommand('ssemojify', { parseFully: false })
		.action(async function(data) {
			await this.msg.channel.send(emojifyString(data[0]), {
				split: {
					char: ' '
				}
			});
		}),
	
	PrefixCommand('ssemojify2', { parseFully: false })
		.action(async function(data) {
			await this.msg.channel.send(emojifyString(data[0]), {
				code: true
			});
		}),

	new MessageAction()
		.condition(msg => msg.content.includes('daddy'))
		.action(msg => msg.react('🥵')),

	PrefixCommand('sstalk')
		.action(async function() {
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
			
			await this.msg.channel.send('Path: ' + arrayToString(path));
		})
		.onError((data, err) => console.error(err)),

] as any as MessageAction<Message>[];
