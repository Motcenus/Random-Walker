import { Walker } from './walker.js';

const canvas = document.getElementById('walkerCanvas');
const walker = new Walker(canvas);

function animate() {
    const ctx = walker.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    walker.drawObstacles();
    walker.drawFood();      // Draw the food
    walker.drawPath();
    walker.drawWalker();

    walker.move();
    requestAnimationFrame(animate);
}

animate();
