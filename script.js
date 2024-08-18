import { Food } from './food.js';
import { Walker } from './walker.js';

const canvas = document.getElementById('gameCanvas');

// Configuration parameters
const numberOfFood = 50;
const numberOfWalkers = 10;

// Create food and walkers
const food = new Food(canvas, 15, numberOfFood);

const walkers = [];
for (let i = 0; i < numberOfWalkers; i++) {
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    walkers.push(new Walker(canvas, food, color));
}

function gameLoop() {
    canvas.width = canvas.width; // Clear the canvas

    walkers.forEach(walker => {
        walker.move();
        walker.drawPath();
        walker.drawWalker();
        walker.drawFood();
        walker.drawScoreAndTimer();
    });

    const leader = walkers.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), walkers[0]);

    walkers.forEach(walker => {
        if (walker !== leader) {
            walker.followTrailIfClose(leader, 50);
        }
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
