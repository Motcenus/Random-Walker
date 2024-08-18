import { Food } from './food.js';
import { Walker } from './walker.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuration parameters
const numberOfFood = 50;
const numberOfWalkers = 100;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Create food and walkers
const food = new Food(canvas, 15, numberOfFood);

const walkers = [];
for (let i = 0; i < numberOfWalkers; i++) {
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    walkers.push(new Walker(canvas, food, color));
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food
    food.drawFood();

    // Update and draw each walker
    walkers.forEach(walker => {
        walker.move();
        walker.drawPath();
        walker.drawWalker();
        walker.drawScoreAndTimer();
    });

    // Determine the leader
    const leader = walkers.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), walkers[0]);

    // Make non-leader walkers follow the leader's trail
    walkers.forEach(walker => {
        if (walker !== leader) {
            walker.followTrailIfClose(leader, 50);
        }
    });

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
