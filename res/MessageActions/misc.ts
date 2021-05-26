import { TypedPrefixCommand } from '../../src/Utils/actions.js';

export default [
	TypedPrefixCommand('ssrand', {}, Number, Number, Boolean)
		.action(function(args) {
			let n = Math.random() * args[1] + args[0];
			if (!args[2])
				n = Math.round(n);

			this.msg.channel.send('Your number: ' + n);
		})
];