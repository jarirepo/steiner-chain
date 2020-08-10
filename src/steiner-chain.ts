import { ICircle } from './circle';
import { Vector } from './vector';

const { PI, pow, sin, sqrt } = Math;

export class SteinerChain {
	readonly R = 1;
	r: number;
	rho: number;
	theta: number;
	circles: ICircle[];
	invertedCircles: ICircle[];
	/** Arbitrary chosen circle of inversion */
	readonly coi: ICircle;
	/** Rotation angle */
	ang = 0;
	angStep = 2 * PI / 10 / 60;

	constructor(public n: number) {
		this.coi  = { p: new Vector(2, 0), r: this.R, color: 'orange' };	// position will affect the scaling
		this.circles = [{ p: new Vector(0, 0), r: this.R, color: '#0000ff' }];
		this.generate(n);
	}

	/** Generates a closed Steiner chain of n circles */
	public generate(n: number): void {
		this.n = n;
		while (this.circles.length > 1) {
			this.circles.pop();
		}
		this.theta = PI / this.n;
		const s = sin(this.theta);
		const kr = (1 + s) / (1 - s);	// R / r
		this.r = this.R / kr;
		this.rho = this.r * s / (1 - s);	// (R - r) / 2
		this.circles.push({ p: new Vector(0, 0), r: this.r, color: '#ff0000' });
		const v = new Vector(this.r + this.rho, 0);
		for (let i = 0; i < this.n; i++) {
			this.circles.push({ p: v.clone(), r: this.rho, color: '#00ff33' });
			v.rotateZ(2 * this.theta);
		}
		this.transform();
	}

	/** Transforms the original closed Steiner chain into another one with the same number of circles by usng circle inversion */
	private transform(): void {
		this.invertedCircles = this.circles.filter((_, i) => i >= 0).map((c, i) => {
			const r2 = this.coi.r * this.coi.r;
			const v = c.p.clone().sub(this.coi.p).normalize();
			const r = v.clone().scale(c.r);
			const v1 = c.p.clone().sub(r).sub(this.coi.p);
			const v2 = c.p.clone().add(r).sub(this.coi.p);
			const p1 = this.coi.p.clone().add(v.clone().scale(r2 / v1.mag()));
			const p2 = this.coi.p.clone().add(v.clone().scale(r2 / v2.mag()));
			return {
				p: new Vector((p1.x + p2.x) / 2, (p1.y + p2.y) / 2),
				r: .5 * sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2)),
				color: c.color
			};
		});

		const ref = this.invertedCircles[0];
		const center = ref.p.clone();		
		this.invertedCircles.forEach((c, i) => c.p.sub(center));
	}

	/** Apply rotation to the Steiner chain circles */
	rotate(): void {
		this.ang += this.angStep;
		for (let i = 2; i < this.circles.length; i++) {
			this.circles[i].p.polar(this.r + this.rho, this.ang + (i - 2) * 2 * this.theta);
		}
		this.transform();
	}

	render(ctx: CanvasRenderingContext2D): void {
		if (false) {
			for (const circle of this.circles) {
				ctx.strokeStyle = circle.color;
				ctx.beginPath();
				ctx.arc(circle.p.x, circle.p.y, circle.r, 0, 2 * Math.PI);
				ctx.stroke();
			}

			ctx.strokeStyle = this.coi.color;
			ctx.setLineDash([7 / 50, 2 / 50]);
			ctx.beginPath();
			ctx.arc(this.coi.p.x, this.coi.p.y, this.coi.r, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// ctx.strokeStyle = this.invertedCircles[0].color;
		// ctx.beginPath();
		// ctx.arc(this.invertedCircles[0].p.x, this.invertedCircles[0].p.y, this.invertedCircles[0].r, 0, 2 * Math.PI);
		// ctx.stroke();

		// ctx.strokeStyle = this.invertedCircles[1].color;
		// ctx.beginPath();
		// ctx.arc(this.invertedCircles[1].p.x, this.invertedCircles[1].p.y, this.invertedCircles[1].r, 0, 2 * Math.PI);
		// ctx.stroke();
		
		for (let i = 2; i < this.invertedCircles.length; i++) {
		// for (const circle of this.invertedCircles) {
			const circle = this.invertedCircles[i];

			// ctx.strokeStyle = circle.c;
			// ctx.beginPath();
			// ctx.arc(circle.p.x, circle.p.y, circle.r, 0, 2 * Math.PI);
			// ctx.stroke();

			// const hue = 360 * circle.r / this.invertedCircles[0].r;
			const hue = 360 * (i + .5) / (this.n + 2);
			const brightness = 100 * circle.r / this.invertedCircles[0].r;
			// const brightness = 50;
			// ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
			// ctx.fillStyle = `hsl(${hue}, 100%, ${brightness}%)`;
			// ctx.strokeStyle = `hsl(${hue}, 100%, ${brightness}%)`;
			// ctx.strokeStyle = circle.c;
			// ctx.strokeStyle = `hsl(${hue}, 100%, ${brightness / 2}%)`;
			// ctx.lineWidth = 2 / 500;

			const gradient = ctx.createRadialGradient(
				circle.p.x - circle.r / 3, circle.p.y + circle.r / 3, circle.r * .1,
				circle.p.x, circle.p.y, circle.r
			);
			// gradient.addColorStop(0, '#fff');
			gradient.addColorStop(0, `rgba(255,255,255,${.5 + brightness / 100})`);
			gradient.addColorStop(.9, `hsl(${hue},100%,${brightness}%)`);
			gradient.addColorStop(1, '#000');
			ctx.fillStyle = gradient;

			ctx.beginPath();
			ctx.arc(circle.p.x, circle.p.y, circle.r, 0, 2 * Math.PI);
			ctx.fill();
			// ctx.stroke();
		}

		// ctx.strokeStyle = '#fff';
		// ctx.beginPath();
		// ctx.moveTo(this.ra, -10);
		// ctx.lineTo(this.ra, 10);
		// ctx.stroke();
	}
}
