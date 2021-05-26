import MessageAction from '../src/MessageAction.js';
import { Message } from 'discord.js';

import conversations from './MessageActions/conversations.js';
import reactions from './MessageActions/reactions.js';
import emojify from './MessageActions/emojify.js';
import game from './MessageActions/game.js';
import misc from './MessageActions/misc.js';

export default () => [
	...emojify,
	...reactions,
	...conversations,
	...game,
	...misc,
] as any as MessageAction<Message>[];
