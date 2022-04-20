
export type BuffSize = 8 | 16 | 32 | 64;

export type ArrayType<T extends BuffSize> = 
	T extends 8 ? Uint8Array :
	T extends 16 ? Uint16Array :
	T extends 32 ? Uint32Array :
	T extends 64 ? BigUint64Array :
	never;

export type NumType<T extends BuffSize> = T extends 64 ? bigint : number;

export default class RingBuffer<Size extends BuffSize> implements Iterable<NumType<Size>> {

	private readonly b: ArrayType<Size>;

	public constructor(
		public readonly dataSize: Size,
		public readonly size = 50
	) {

		if (size <= 0 || size % 1 !== 0)
			throw 'Size must be a positive integer';

		switch (dataSize) {
			case 8:  (this.b as RingBuffer<8> ['b']) = new Uint8Array(size);     break;
			case 16: (this.b as RingBuffer<16>['b']) = new Uint16Array(size);    break;
			case 32: (this.b as RingBuffer<32>['b']) = new Uint32Array(size);    break;
			case 64: (this.b as RingBuffer<64>['b']) = new BigUint64Array(size); break;
		}
	}
	
	public static createWithByteSize<Size extends BuffSize>(bytes: number, dataSize: Size) {
		return new RingBuffer<Size>(dataSize, bytes / dataSize);
	}

	public *[Symbol.iterator]() {
		const end = (this.p + this.count - 1) % this.size;
		let i = (this.p + this.size) % this.size;
		for (; i !== end; i = (i + 1) % this.size)
			yield this.b[i] as NumType<Size>;
		yield this.b[i] as NumType<Size>;
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
	public add(value: NumType<Size>) {
		this.b[this.p] = value;
		this.p = (this.p + 1) % this.size;
		if (this.count < this.size)
			this._count++;
	}

	public addAll(values: ArrayLike<NumType<Size>>) {
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

	public addIterable(it: Iterable<NumType<Size>>) {
		for (const n of it)
			this.add(n);
	}

}
