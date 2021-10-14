import { textDialog, indexedDialog } from '../../src/utils/dialog.js';
import { PrefixCommand } from '../../src/utils/actions.js';

export default () => [
	PrefixCommand('sstoned')
		.action(async function() {
			textDialog(this.msg.channel, this.author, {
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
		indexedDialog(this.msg.channel, this.author, {
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
	})
];