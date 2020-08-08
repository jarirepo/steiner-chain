export class Vector {
	
	constructor(public x = 0, public y = 0) { }

	clone(): Vector {
		return new Vector(this.x, this.y);
	}

	set(x: number, y: number, z?: number): Vector {
		this.x = x;
		this.y = y;
		return this;
	}
	
	polar(r: number, theta: number): Vector {
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
		return this;
	}

	mag(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	add(v: Vector): Vector {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	scale(value: number): Vector {
		this.x *= value;
		this.y *= value;
		return this;
	}

	rotateZ(alpha: number): Vector {
		const c = Math.cos(alpha);
		const s = Math.sin(alpha);
		const x = this.x * c - this.y * s;
		this.y = this.x * s + this.y * c;
		this.x = x;
		return this;
	}

	sub(v: Vector): Vector {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	normalize(): Vector {
		const m = this.mag();
		this.x /= m;
		this.y /= m;
		return this;
	}

	dot(v: Vector): number {
		return this.x * v.x + this.y * v.y;
	}
}
