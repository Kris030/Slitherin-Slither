import { Writable, Readable } from 'stream';

export default class RingBufferByte extends Writable implements Iterable<number> {

	private readonly b: Buffer;

	public constructor(
		public readonly size = 50
	) {
		super();

		if (size <= 0 || size % 1 !== 0)
			throw 'Size must be a positive integer';

		this.b = Buffer.allocUnsafe(size);
	}

	public _write(chunk: any, enc: BufferEncoding, callback: (error?: Error | null) => void) {

		if (Buffer.isBuffer(chunk))
			this.addBuffer(chunk);
		else
			throw 'Only supports buffers';

		callback();
	}

	public toReadStream(copy=false): Readable {
		let buff: Uint8Array, p = this.p, size = this.size, count = this.count;
		console.log({ p, size, count });
		
		if (copy) {
			buff = new Uint8Array(size);
			this.b.copy(buff);
		} else
			buff = this.b;
		
		let u = 0;
		// TODO
		return new Readable({
			read(a) {
				if (u + a > count)
					a = count - u;

				const s = (p + u) % size, e = (s + a) % size;
				console.log({ u, a, s, e });

				if (s <= e && e !== 0)
					this.push(buff.subarray(s, e));
				else {
					const f = buff.subarray(s, size)
					this.push(f);
					this.push(buff.subarray(s, a - f.length));
				}

				u += a;
				if (u === count) {
					this.emit('end');
					console.log('END');
				}
			}
		});
	}

	public *[Symbol.iterator]() {
		const end = (this.p + this.count - 1) % this.size;
		let i = (this.p - this.size) % this.size;
		for (; i !== end; i = (i + 1) % this.size)
			yield this.b[i];
		yield this.b[i];
	}

	private _count = 0;
	public get count() {
		return this._count;
	}
	
	public get isFull() {
		return this.size === this._count;
	}

	public get isEmpty() {
		return this.size === 0;
	}

	private p = 0;
	public add(value: number) {
		this.b[this.p] = value;
		this.p = (this.p + 1) % this.size;
		if (this.count < this.size)
			this._count++;
	}

	public addBuffer(buff: Buffer) {

		if (buff.length >= this.size) {
			buff.copy(this.b, 0, buff.length - this.size);
			this._count = this.size;
			this.p = 0;
		} else {

			const e = this.p + buff.length;
			if (e < this.size) {
				buff.copy(this.b, this.p);
				this.p = e;
			} else {
				const copied = buff.copy(this.b, this.p, 0, this.size - this.p);
				this.p = buff.copy(this.b, 0, copied);
			}

		}

	}

	public addAll(values: ArrayLike<number>) {
		if (Buffer.isBuffer(values)) {
			this.addBuffer(values);
			return;
		}

		// NON BUFFER
		if (values.length >= this.size) {

			this._count = this.size;
			this.p = 0;

			let i = 0, j = values.length - this.size;
			while (i < this.size)
				this.b[i++] = values[j++];

		} else {

			const e = this.p + values.length;

			if (e < this.size) {
				this.b.set(values as ArrayLike<number> & ArrayLike<bigint>, this.p);
				this.p = e;
			} else {

				let i = this.p, j = 0;
				while (i < this.size)
					this.b[i++] = values[j++];
				
				i = 0;
				while (j < values.length)
					this.b[i++] = values[j++];

				this.p = i;
			}
		}
	}

	public addIterable(it: Iterable<number>) {
		for (const n of it)
			this.add(n);
	}

}
