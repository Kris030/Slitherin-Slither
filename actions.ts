import { Message, User } from 'discord.js';
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
		})
] as any as MessageAction<Message>[];

export default as;