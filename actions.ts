import { Message, User } from 'discord.js';
import { indexedDialog, textDialog } from './Utils/dialog.js';
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

	PrefixCommand('sstoned')
		.action(async function() {
			textDialog(this.msg.channel, this.msg.author, {
				prompt: 'you stoned?',
				responses: [
					{
						answer: 'yes',
						branch: {
							prompt: 'I\'m telling your momma',
						}
					}, {
						answer: 'no',
						branch: {
							prompt: 'lol want some? 🥦',
							responses: [
								{
									answer: 'yes',
									branch: {
										prompt: 'sry we\'re out of stock'
									}
								}, {
									answer: 'no',
									branch: {
										prompt: 'then why did you ask in the first place... you probably have homework to do'
									}
								}
							]
						}
					},
				]
			}).path;
		})
		.onError((data, err) => console.error(err)),

	PrefixCommand('sshop')
	.action(async function() {
		indexedDialog(this.msg.channel, this.msg.author, {
			prompt: 'hey, watcha doin here?',
			responses: [
				{
					answer: 'buyin\'',
					branch: {
						prompt: 'Great, we have rope, lampoil and bombs. You want it? It\'s yours my friend!',
						responses: [
							{
								answer: 'rope',
								branch: {
									prompt: 'kys'
								}
							}, {
								answer: 'lampoil',
								branch: {
									prompt: 'cover yourself in oil'
								}
							}, {
								answer: 'bombs',
								branch: {
									prompt: 'allahu lol'
								}
							},
						]
					}
				}, {
					answer: 'sellin\'',
					branch: {
						prompt: 'What do you have for me?',
						responses: [
							{
								answer: 'children',
								branch: {
									prompt: 'good, we were almost out of livestock'
								}
							}, {
								answer: 'penis',
								branch: {
									prompt: 'I\'ll take #2 please'
								}
							}, {
								answer: 'funi',
								branch: {
									prompt: 'but is it true?',
									responses:[
										{
											answer: 'yes',
											branch: {
												prompt: 'redpilled'
											}
										}, {
											answer: 'no',
											branch: {
												prompt: 'bluepilled'
											}
										}
									]
								}
							}, 
						]
					}
				},
			],
		})
	}),

	TypedPrefixCommand('ssgame', {}, Number, Number)
		.condition(async function([w, h]) {
			if (w <= 0 || w > 10) {
				await this.msg.channel.send('Width must be between 1 and 10');
				return false;
			}
			if (h < 0 || h > 10) {
				await this.msg.channel.send('Height must be between 1 and 10');
				return false;
			}
			return true;
		})
		.action(async function([w, h]) {

			type GameObject = {
				character: string;
			};

			const map: GameObject[][] = new Array(w);
			for (let x = 0; x < w; x++) {
				map[x] = new Array<GameObject>(h);
				for (let y = 0; y < map[x].length; y++)
					map[x][y] = {
						character: '🟦'
					};
			}
			
			const player: GameObject = {
				character: '👺'
			};

			const renderMap = () => {
				let s = '';
				for (let x = 0; x < h; x++) {
					for (let y = 0; y < w; y++)
						s += map[y][x].character + ' ';
					s += '\n';
				}
				return s;
			};

			const mapMessage = await this.msg.channel.send(renderMap()),
					renderMessage = async () => mapMessage.edit(renderMap());


		}),
] as any as MessageAction<Message>[];
