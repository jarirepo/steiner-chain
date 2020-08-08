import { EventEmitter } from 'events';
import { Vector } from './vector';

interface MouseOptions {
	el: HTMLElement;
}

interface ButtonState {
	id: number;
	pressed: boolean;
	moving: boolean;
	start: Vector;
	cursor?: string;
	shift?: boolean;
}

export class Mouse extends EventEmitter {

	static readonly LEFT = 0;		// pan
	static readonly WHEEL = 1;	// zoom in/out at (x,y)
	static readonly RIGHT = 2;	// rotate +/-, with <shift> key

	readonly buttonStates: ButtonState[] = [
		{ id: Mouse.LEFT, pressed: false, moving: false, start: new Vector(), cursor: 'grabbing' },
		{ id: Mouse.WHEEL, pressed: false, moving: false, start: new Vector() },
		{ id: Mouse.RIGHT, pressed: false, moving: false, start: new Vector(), shift: true }
	];

	readonly canvas: HTMLCanvasElement;
	readonly rect: DOMRect;
	readonly pos = new Vector();
	
	constructor(readonly opts: MouseOptions) {
		super();
		this.canvas = opts.el as HTMLCanvasElement;
		this.rect = this.canvas.getBoundingClientRect();
		this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
		this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
		this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
		this.canvas.addEventListener('wheel', this.onWheel.bind(this));
	}

	public get anyButtonPressed(): boolean {
		return this.buttonStates.map(state => state.pressed).reduce((result, val) => result || val, false);
	}

	private onMouseDown(event: MouseEvent): void {
		const pressed = (this.buttonStates[event.button].shift && event.shiftKey) || (!this.buttonStates[event.button].shift && !event.shiftKey);
		if (pressed) {
			event.preventDefault();
		}
		this.updatePos(event);
		this.buttonStates[event.button].pressed = pressed;
		this.buttonStates[event.button].start.x = this.pos.x;
		this.buttonStates[event.button].start.y = this.pos.y;
		if (this.buttonStates[event.button].cursor) {
			this.canvas.style.cursor = this.buttonStates[event.button].cursor;
		}
	}

	private onMouseMove(event: MouseEvent): void {
		this.updatePos(event);
		this.buttonStates.filter(state => state.pressed).forEach(state => {
			state.moving = true;
			const dir = this.pos.clone().sub(state.start);
			state.start.x = this.pos.x;
			state.start.y = this.pos.y;

			switch (state.id) {
				case Mouse.LEFT:
					this.emit('leftdrag', { originalEvent: event, dir })
					break;
				case Mouse.RIGHT:
					this.emit('rightdrag', { originalEvent: event, dir })
					break;
			}
		});
	}

	private onMouseUp(event: MouseEvent): void {		
		// event.preventDefault();
		this.buttonStates[event.button].pressed = false;
		this.buttonStates[event.button].moving = false;
		this.canvas.style.cursor = 'grab';	
	}

	private onWheel(event: WheelEvent): void {		
		this.updatePos(event);
		this.emit('wheel', { originalEvent: event, pos: this.pos });
	}

	private updatePos(event: MouseEvent): void {
		this.pos.x = event.x - this.rect.left;
		this.pos.y = event.y - this.rect.top;
	}
}
