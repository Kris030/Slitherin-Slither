
export default class RingBuffer<T> implements Iterable<T> {

	private readonly b: T[];

	public constructor(
		public readonly size = 50
	) {
		if (size <= 0 || size % 1 !== 0)
			throw 'Size must be a positive integer';

		this.b = new Array(size);
	}

	public *[Symbol.iterator]() {
		const end = (this.p + this.count - 1) % this.size;
		let i = (this.p + this.size) % this.size;
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
	public add(value: T) {
		this.b[this.p] = value;
		this.p = (this.p + 1) % this.size;
		if (this.count < this.size)
			this._count++;
	}

	public addAll(values: ArrayLike<T>) {
		if (values.length >= this.size) {

			this._count = this.size;
			this.p = 0;

			let i = 0, j = values.length - this.size;
			while (i < this.size)
				this.b[i++] = values[j++];

		} else {

			const e = this.p + values.length;

			if (e < this.size) {
				let i = this.p, j = 0;
				while (i < e)
					this.b[i++] = values[j++];
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

	public addIterable(it: Iterable<T>) {
		for (const n of it)
			this.add(n);
	}

}
