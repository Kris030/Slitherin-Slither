import MessageAction from '../src/MessageAction.js';
import { Message } from 'discord.js';

import conversations from './message_actions/conversations.js';
import reactions from './message_actions/reactions.js';
import emojify from './message_actions/emojify.js';
import economy from './message_actions/economy.js';
import voice from './message_actions/voice.js';
import game from './message_actions/game.js';
import misc from './message_actions/misc.js';
import test from './message_actions/test.js';

export default () => [
	...emojify(),
	...reactions(),
	...conversations(),
	...game(),
	...misc(),
	...economy(),
	...voice(),
	...test(),
] as any as MessageAction<Message>[];
