export class Obstacle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.obstacles = [];
        this.maxObstacles = 10; // Maximum number of obstacles
    }

    drawObstacles() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.obstacles.forEach(obstacle => {
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    addObstacle(x, y, radius) {
        if (this.obstacles.length < this.maxObstacles) {
            this.obstacles.push({ x, y, radius });
        }
    }

    detectCollision(x, y, size) {
        return this.obstacles.some(obstacle => {
            const dx = x - obstacle.x;
            const dy = y - obstacle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (size + obstacle.radius);
        });
    }
}
