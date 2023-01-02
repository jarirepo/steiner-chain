import Stats from 'stats.js';
import { saveAs, FileSaverOptions } from 'file-saver';
import { SteinerChain } from './steiner-chain';
import { Mouse } from './mouse';
import { Vector } from './vector';

const steiner = new SteinerChain( 5 );	// n = 3,4,5,...

const stats = new Stats();
stats.showPanel( 0 ); // fps
stats.dom.style.position = 'relative';
document.querySelector('#stats').appendChild(stats.dom);

const canvas = document.querySelector<HTMLCanvasElement>('canvas#scene');
const context = canvas.getContext('2d');
context.fillStyle = '#111';
context.fillRect(0, 0, canvas.width, canvas.height);

const mouse = new Mouse({ el: canvas });

mouse.on('wheel', (e: { originalEvent: WheelEvent, p: Vector }) => {
	e.originalEvent.preventDefault();
	if (e.originalEvent.shiftKey) {
		const incr = (e.originalEvent.deltaY < 0) ? 1 : -1;
		const n = Math.max(3, steiner.n + incr);
		steiner.generate(n);
	}
});

document.body.onkeypress = (e: KeyboardEvent) => {
	switch (e.key) {
		case 's':
		case 'S':
			if (e.shiftKey && canvas.toBlob) {
				canvas.toBlob(blob => {
					// saveAs(blob, `steiner-chain-${steiner.n}.png`);
					const file = new File([blob], `steiner-chain-${steiner.n}.png`, { type: 'image/png' })
					saveAs(file);
				});
			}
			break;
		case '-':
		case '+':
			const n = (e.key === '-') ? Math.max(3, steiner.n - 1) : Math.min(100, steiner.n + 1);
			steiner.generate(n);
			break;
	}
};

const scale = 500;
const transform: DOMMatrix2DInit = {
	m11: scale,
	m12: 0,
	m21: 0,
	m22: -scale,
	m41: canvas.width / 2,
	m42: canvas.height / 2	
};

context.fillStyle = '#000';
context.lineWidth = 1 / scale;
context.fillRect(0, 0, canvas.width, canvas.height);

function animate(time = 0) {
	stats.begin();
	steiner.rotate();

	// context.fillStyle = '#fff';
	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.save();
	context.setTransform(transform);

	// context.fillStyle = '#000';
	// context.fillRect(-1, -1, 2, 2);

	steiner.render(context);
	context.restore();	
	stats.end();
	requestAnimationFrame(animate);
}

animate();
