import { Channel, Guild, User } from 'discord.js';
import { client } from '../index.js';
import { Parser } from 'expr-eval';

/**
 * Types that are supported by `parseType`.
 */
export type ParseSupportedType = StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor | BigIntConstructor | RegExpConstructor | Object | User | Channel | URL;

/**
 * A type that maps primitive type constructors to their actual types for `ParseSupportedType`s.
 */
export type PrimitiveConstructor<T extends ParseSupportedType> =
T extends BooleanConstructor ? boolean :
T extends StringConstructor ? string :
T extends NumberConstructor ? number :
T extends BigIntConstructor ? bigint :
T extends RegExpConstructor ? RegExp :
T extends DateConstructor ? Date :
T extends ObjectConstructor ? object : T;

/**
 * Primitive verison of `ParseSupportedType`.
 */
export type PrimitiveParseSupportedType = PrimitiveConstructor<ParseSupportedType>;

/**
 * Type mappings for the `parseType` function.
 */
export type ParsedType<T extends ParseSupportedType> =
T extends (typeof User) ? Promise<User> :
T extends (typeof Channel) ? Promise<Channel> :
T extends (typeof URL) ? URL : PrimitiveConstructor<T>;

const mathParser = new Parser();
/**
 * Parses a string as a given type.
 * 
 * @param string The string to parse.
 * @param type The type to parse as.
 */
export function parseType<T extends ParseSupportedType>(string: string, type: T): ParsedType<T> {
	let ret: any;
	switch (type as ParseSupportedType) {
		case String: ret = string; break;
		case Number: ret = mathParser.evaluate(string); break;
		case Boolean: ret = Boolean(string); break;
		case Date: ret = new Date(string); break;
		case User: ret = getUserFromMention(string); break;
		case Channel: ret = getChannelFromMention(string); break;
		case URL: ret = new URL(string); break;
		case BigInt: ret = BigInt(string); break;
		case RegExp: ret = new RegExp(string); break;
		case Object: ret = JSON.parse(string); break;
		default: throw 'Unsupported type or value ' + type;
	}
	if (ret === undefined)
		throw 'Parse returned undefined';
	return ret;
}

/**
 * A regex that checks whether a string is a valid discord mention of any type.
 */
export const mentionRegex = /^<(?:@!?)|#\d+>$/;

/**
 * Tests a given string with `mentionRegex`.
 * @param str The string to test.
 */
export function isMention(str: string): boolean {
	return mentionRegex.test(str);
}

/**
 * Parses a string as a discord user mention.
 * @param string The string to parse.
 */
 export async function getUserFromMention(mention: string) {
	const matches = mention.match(/^<@!?(\d{18})>$/);
	if (!matches)
		throw 'Not a user mention!';
	return client.users.fetch(matches[1]);
}

/**
 * Parses a string as a discord role mention.
 * @param string The string to parse.
 */
export async function getRoleFromMention(mention: string, guild: Guild) {
	const matches = mention.match(/^<@&(\d{18})>$/);
	if (!matches)
		throw 'Not a role mention!';
	return guild.roles.fetch(matches[1]);
}

/**
 * Parses a string as a discord channel mention.
 * @param string The string to parse.
 */
export async function getChannelFromMention(mention: string) {
	const matches = mention.match(/^<#(\d{18})>$/);
	if (!matches)
		throw 'Not a channel mention!';
	return client.channels.fetch(matches[1]);
}
