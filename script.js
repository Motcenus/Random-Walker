import { Food } from './food.js';
import { Walker } from './walker.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuration parameters
const numberOfFood = 50;
const numberOfWalkers = 50;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Create food and walkers
const food = new Food(canvas, 5, numberOfFood);

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
        walker.handleFoodCollision(); // Check for food collisions
        walker.drawPath();
        walker.drawWalker();
        walker.drawScoreAndTimer();
    });

    // Update food status
    food.updateFoodStatus();

    // Determine the leader (walker with the highest score)
    const leader = walkers.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), walkers[0]);

    // Make non-leader walkers follow the leader's trail
    walkers.forEach(walker => {
        if (walker !== leader) {
            walker.followTrailIfClose(leader, 50);
        }
    });

    // Display the highest score and its color
    displayHighestScore(leader);

    // Request next frame
    requestAnimationFrame(gameLoop);
}

function displayHighestScore(leader) {
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = leader.color;
    ctx.fillText(`Highest Score: ${leader.score}`, canvas.width / 2, 50);
}

// Start the game loop
gameLoop();
