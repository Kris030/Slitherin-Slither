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
] as any as MessageAction<Message>[];
