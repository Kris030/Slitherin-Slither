import MessageAction from '../MessageActions/MessageAction.js';

export default [
	new MessageAction()
		.condition(msg => msg.content.includes('daddy'))
		.action(msg => msg.react('🥵'))
];