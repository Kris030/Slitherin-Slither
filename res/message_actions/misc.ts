import { SubbedCommand, TypedPrefixCommand } from '../../src/utils/actions.js';

const configs = new Map<string, string>();
export default () => [
	TypedPrefixCommand('ssrand', {}, Number, Number, Boolean)
		.action(function(args) {
			let n = Math.random() * args[1] + args[0];
			if (!args[2])
				n = Math.round(n);

			this.msg.channel.send('Your number: ' + n);
		}),

	SubbedCommand('ssconfig', {
		get([ prop ]) {
			this.msg.channel.send(prop + ': ' + configs.get(prop));
		}, set([ prop, ...others]) {
			let s = others.reduce((p, c) => p + '\n' + c);
			configs.set(prop, s);
			this.msg.channel.send(`Set ${prop} to ` + s);
		}, list() {
			let m = '';
			for (const entry of configs.entries())
				m += entry[0] + `: ${entry[1]}\n`;
			
			this.msg.channel.send(m ? m : 'nothing here...');
		}
	})
	
];