import { ActionErrorHandler, Middleware, Condition, SimpleAction } from './utils/actions.js';
import { Message } from 'discord.js';

enum ActionType {
	MIDDLEWARE,
	CONDITION,
	SIMPLE_ACTION
}

export default class MessageAction<T = Message> {

	private data: T;

	private defaultErrorHandler: ActionErrorHandler<any>;

	private readonly actions: {
		type: ActionType;
		action: Middleware<T, any> | Condition<T> | SimpleAction<T>,
		onError: ActionErrorHandler<T>;
	}[] = [];
	private final: SimpleAction<T>;

	constructor(defaultErrorHandler?: ActionErrorHandler<any>) {
		this.defaultErrorHandler = defaultErrorHandler;
	}

	public middleware<R>(middleware: Middleware<T, R>): MessageAction<R> {
		this.actions.push({
			type: ActionType.MIDDLEWARE,
			action: middleware,
			onError: this.defaultErrorHandler
		});
		return this as any;
	}

	public condition(condition: Condition<T>) {
		this.actions.push({
			type: ActionType.CONDITION,
			action: condition,
			onError: this.defaultErrorHandler
		});
		return this;
	}

	public action(condition: SimpleAction<T>) {
		this.actions.push({
			type: ActionType.SIMPLE_ACTION,
			action: condition,
			onError: this.defaultErrorHandler
		});
		return this;
	}

	public onError(errorHandler: ActionErrorHandler<T>, { overrideDefault=false } ={}) {
		if (this.actions.length == 0)
			throw 'No action yet';
		
		this.actions[this.actions.length - 1].onError = errorHandler;
		return this;
	}

	public finally(action: SimpleAction<T>) {
		this.final = action;
		return this;
	}

	private _msg: Message;
	public get msg() {
		return this._msg;
	}
	
	public reply: Message['channel']['send'] = function(...args: any[]) {
		return this.channel.send(...args);
	}

	public get channel() { return this.msg.channel; }
	public get author() { return this.msg.author; }
	public temp: any;

	private currentError: ActionErrorHandler<T>;
	private currentAction: Middleware<T, any> | Condition<T> | SimpleAction<T>;
	public async run(msg: Message): Promise<boolean> {
		this.data = this._msg = msg as any;
		let ret = true;

		loop:
		for (const a of this.actions) {
			this.currentError = a.onError;
			this.currentAction = a.action;

			try {
				switch (a.type) {
					case ActionType.CONDITION:
						if (await (this.currentAction as Condition<T>)(this.data))
							continue;
						ret = false;
						break loop;

					case ActionType.MIDDLEWARE:
						this.data = await (this.currentAction as Middleware<T, any>)(this.data);
						break;

					case ActionType.SIMPLE_ACTION:
						await this.currentAction(this.data);
						break;

					default:
						throw 'Invalid action type ' + a;
				}

			} catch (e) {
				if (await this.currentError?.(this.data, e) === true)
					continue;

				ret = false;
				break loop;
			}
		}

		await this.final?.(this.data);

		this.currentAction = this.currentError = this.data = this._msg = this.temp = null;
		return ret;
	}
}
