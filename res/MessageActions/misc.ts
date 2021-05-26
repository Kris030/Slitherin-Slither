import { TypedPrefixCommand } from '../../src/Utils/actions.js';

export default [
	TypedPrefixCommand('ssrand', {}, Number, Number, Boolean)
		.action(function(args) {
			let n = Math.random() * args[0] + args[1];
			if (!args[2])
				n = Math.round(n);

			this.msg.channel.send('Your number: ' + n);
		})
];