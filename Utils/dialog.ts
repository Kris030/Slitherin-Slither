import { MaybePromise } from './general';
import { Channel, Message, TextChannel, User } from 'discord.js';

export type DialogTree<P, A> = {
	readonly prompt: P;
	readonly responses?: {
		readonly answer: A;
		readonly branch: DialogTree<P, A>;
	}[];
};

export type TextDialogTree = DialogTree<string, string>;
export type PredicateDialogTree = DialogTree<(channel: TextChannel) => any, (msg: Message) => MaybePromise<boolean>>;

export const textDialog = (channel: Channel, users: User | User[], dialog: TextDialogTree, { timeout=60_000 } = {}) => {
	if (!channel.isText())
		throw 'Not a text channel';

	if (!Array.isArray(users))
		users = [users];

	let abort: () => void;
								/* could be buggy...? */
	return { path: new Promise<number[]>(async (resolve, reject) => {
		const path: number[] = [];

		for (;;) {
			await channel.send(dialog.prompt);
			let index: number;
			
			const collector = channel.createMessageCollector(
				(msg: Message) => {
					if (!(users as User[]).includes(msg.author))
						return false;
					return (index = dialog.responses.findIndex(r => r.answer == msg.content)) != -1;
				}, {
					max: 1,
					time: timeout
				}
			);

			abort = collector.stop;

			await new Promise<void>((resolve, reject) => collector.on('end', _ => resolve()));

			path.push(index);

			dialog = dialog.responses[index]?.branch;
			if (index == -1 || !dialog)
				return resolve(path);
		}
	}), abort }
};
