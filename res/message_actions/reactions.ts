import MessageAction from '../../src/MessageAction.js';

export default [
	new MessageAction()
		.condition(msg => msg.content.includes('daddy'))
		.action(msg => msg.react('🥵'))
];