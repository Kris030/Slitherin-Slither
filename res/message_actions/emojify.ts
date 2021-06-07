import { PrefixCommand } from '../../src/utils/actions.js';
import { emojifyString } from '../../src/utils/emojis.js';

export default () => [
	PrefixCommand('ssemojify', { parseCount: -1 })
		.action(async function(data) {
			await this.reply(emojifyString(data[0]), {
				split: {
					char: ' '
				}
			});
		}),
	
	PrefixCommand('ssemojify2', { parseCount: -1 })
		.action(async function(data) {
			await this.reply(emojifyString(data[0]), {
				code: true
			});
		}),	
];
