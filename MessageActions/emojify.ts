import { PrefixCommand } from '../Utils/actions.js';
import { emojifyString } from '../Utils/emojis.js';

export default [
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
];