
/**
 * Returns a promise for waiting an amount of milliseconds.
 * @param ms The amount of time in milliseconds.
*/
export function sleep(ms: number) {
	return new Promise<void>(res => setTimeout(res, ms));
}

/**
 * Returns a cancellable promise for waiting an amount of milliseconds.
 * @param ms The amount of time in milliseconds.
*/
export function cancellableSleep(ms: number) {
	let id: NodeJS.Timeout;
	return {
		promise: new Promise<void>(res => id = setTimeout(res, ms)),
		cancel: () => clearTimeout(id)
	};
}

/**
 * Returns a promise for waiting an amount of milliseconds.
 * @param ms The amount of time in milliseconds.
*/
export function sleepCancellable(ms: number) {
	let timeout: NodeJS.Timeout;
	return { 
		promise: new Promise<void>(res => timeout = setTimeout(res, ms)),
		timeout
	};
}

/**
 * Returns a random element of the specified array.
 * @param array The array to return from.
 */
export function getRandomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Indents all lines of a string.
 * 
 * @param str The string to indent.
 * @param level The indentation level.
 * @param indenter The string to indent with. A single tab by default.
 */
export function indent(str: string, level: number, indenter: string = '\t') {
	if (level < 0)
		throw 'Indent should be greater than 0.';
	const repl = indenter.repeat(level);
	return repl + str.replace(/\n/g, '\n' + repl);
}

/**
 * Converts an arry to a string in the following format: `<begin><value><separator><value><end>`.
 * 
 * @param array The array to convert.
 * @param separator The separator.
 * @param begin The beginning of the string.
 * @param end The end of the string.
 */
export function arrayToString(array: any[], { separator=', ', begin='[', end=']' }: { separator?: string; begin?: string; end?: string } = {}): string {
	const l = array.length - 1;
	let str = begin, i = 0;
	for (; i < l; i++)
		str += array[i] + separator;
	return str + array[i] + end;
}

export function random(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Extracts the resolved type from a `Promise`.
 */
export type Await<T> = T extends PromiseLike<infer U> ? Await<U> : T;

/**
 * A shorthand for `T | Promise<T>`.
 */
export type MaybePromise<T = any> = T | Promise<T>;

/**
 * Swaps by elements of two arrays by-coordinate.
 * 
 * @param array1 the first array.
 * @param array2 the second array.
 * @param index1 the index of the element from the first array.
 * @param index2 the index of the element from the second array.
 */
export function swap(array1: any[], array2: any[], index1: number, index2: number) {
	[array1[index1], array2[index2]] = [array2[index2], array1[index1]];
}

/**
 * 
 * Swaps by elements of two matricies by-coordinate.
 * 
 * @param array1 the first matrix.
 * @param array2 the first matrix.
 * @param x1 the x coordinate of the element from the first matrix.
 * @param y1 the y coordinate of the element from the first matrix.
 * @param x2 the x coordinate of the element from the second matrix.
 * @param y2 the y coordinate of the element from the second matrix.
 */
export function swap2d(array1: any[][], array2: any[][], x1: number, y1: number, x2: number, y2: number) {
	[array1[x1][y1], array2[x2][y2]] = [array2[x2][y2], array1[x1][y1]];
}

/**
 * Converts degrees to radians.
 * @param degrees The angle in degrees.
 * @returns The angle in radians.
 */
export function toRadians(degrees: number): number {
	return Math.PI / 180 * degrees;
}

/**
 * Converts degrees to degrees.
 * @param radians The angle in radians.
 * @returns The angle in degrees.
 */
export function toDegrees(radians: number) {
	return 180 / Math.PI * radians;
}

export function dateToString(d: number | Date, lessThanOneSec='less than a second') {
	if (typeof d === 'number')
		d = new Date(d);
	
	let pp = '';
	if (d.getUTCHours() > 0)
		pp += d.getUTCHours() + 'h ';
	if (d.getMinutes() > 0)
		pp += d.getMinutes() + 'm ';
	if (d.getSeconds() > 0)
		pp += d.getSeconds() + 's';
	
	return pp || lessThanOneSec;
}