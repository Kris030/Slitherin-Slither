import { PrefixCommand } from '../../src/utils/actions.js';
import { emojifyString } from '../../src/utils/emojis.js';

export default () => [
	PrefixCommand('ssemojify', { parseCount: 0 })
		.action(async function(data) {
			await this.reply(emojifyString(data[0]), {
				split: {
					char: ' '
				}
			});
		}),
	
	PrefixCommand('ssemojify2', { parseCount: 0 })
		.action(async function(data) {
			await this.reply(emojifyString(data[0]), {
				code: true
			});
		}),	
];
