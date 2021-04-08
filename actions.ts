import { Message } from 'discord.js';
import MessageAction from './MessageActions/MessageAction.js';

import emojify from './MessageActions/emojify.js';
import game from './MessageActions/game.js';
import conversations from './MessageActions/conversations.js';
import reactions from './MessageActions/reactions.js'

export default () => [
	...emojify,
	...reactions,
	...conversations,
	game,
] as any as MessageAction<Message>[];
