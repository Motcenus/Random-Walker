export class Walker {
    constructor(canvas, food, walkers, color = '#ff0000') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = 5;
        this.color = color;
        this.minStepSize = 2;
        this.maxStepSize = 5;
        this.path = [];
        this.maxPathLength = 1000;
        this.hunger = 100;
        this.hungerDecreaseRate = 0.05;
        this.hungerThreshold = 30;
        this.learningRate = 0.1;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.food = food;
        this.walkers = walkers; // List of all walkers
        this.score = 0;
        this.startTime = Date.now();
        this.timeElapsed = 0;

        // Movement preferences
        this.preferences = Array(8).fill(0);
        this.moveCount = 0;

        // Movement state
        this.currentAngle = Math.random() * 2 * Math.PI; // Initial random angle
        this.angleChangeRate = 0.5; // Increased randomness in angle changes
        this.maxStraightLineLength = 10; // Prevent straight-line movement
        this.straightLineCounter = 0;

        // Canvas boundary constraints
        this.boundaryBuffer = 20; // Buffer to keep the walker within the canvas
    }

    drawFood() {
        this.food.drawFood();
    }

    drawWalker() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    drawPath() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.5;

        this.path.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });

        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    drawScoreAndTimer() {
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';

        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.ctx.fillText(`Time: ${this.timeElapsed}s`, 10, 60);
        this.ctx.fillText(`Hunger: ${Math.floor(this.hunger)}`, 10, 90);
    }

    detectCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (r1 + r2);
    }

    move() {
        this.path.push({ x: this.x, y: this.y });

        if (this.path.length > this.maxPathLength) {
            this.path.shift();
        }

        this.hunger = Math.max(0, this.hunger - this.hungerDecreaseRate);

        // Determine movement based on hunger
        const stepSize = this.hunger < this.hungerThreshold ? this.maxStepSize : this.minStepSize + Math.random() * (this.maxStepSize - this.minStepSize);

        // Increase randomness in angle change
        if (Math.random() < 0.2 || this.straightLineCounter >= this.maxStraightLineLength) {
            // Randomly change the angle more aggressively
            this.currentAngle += (Math.random() - 0.5) * this.angleChangeRate;
            this.currentAngle = (this.currentAngle + 2 * Math.PI) % (2 * Math.PI); // Normalize angle
            this.straightLineCounter = 0;
        }

        // Calculate the new position
        let newX = this.x + stepSize * Math.cos(this.currentAngle);
        let newY = this.y + stepSize * Math.sin(this.currentAngle);

        // Adjust direction if near the edges
        const edgeBuffer = this.size + this.boundaryBuffer;
        const rightEdge = this.canvas.width - edgeBuffer;
        const bottomEdge = this.canvas.height - edgeBuffer;

        if (newX < edgeBuffer) {
            newX = edgeBuffer;
            this.currentAngle = Math.random() * Math.PI + Math.PI; // Move right
        } else if (newX > rightEdge) {
            newX = rightEdge;
            this.currentAngle = Math.random() * Math.PI; // Move left
        }

        if (newY < edgeBuffer) {
            newY = edgeBuffer;
            this.currentAngle = Math.random() * (Math.PI / 2) + (3 * Math.PI / 2); // Move down
        } else if (newY > bottomEdge) {
            newY = bottomEdge;
            this.currentAngle = Math.random() * (Math.PI / 2) + (Math.PI / 2); // Move up
        }

        // Update the position of the walker
        this.x = newX;
        this.y = newY;
        this.straightLineCounter++;
    }

    handleFoodCollision() {
        const foodItems = this.food.getFoodItems();
        this.food.foods = foodItems.filter(food => {
            const collision = this.detectCircleCollision(this.x, this.y, this.size, food.x, food.y, this.food.foodSize);
            if (collision) {
                this.score += 1;
                this.hunger = Math.min(100, this.hunger + 20);
                this.updatePreferences(true);
                return false;
            }
            return true;
        });

        if (this.food.getFoodItems().length > 0) {
            this.updatePreferences(false);
        }
    }

    selectDirection() {
        const total = this.preferences.reduce((a, b) => a + b, 0);
        const random = Math.random() * total;
        let sum = 0;

        for (let i = 0; i < this.preferences.length; i++) {
            sum += this.preferences[i];
            if (random <= sum) return i;
        }

        return Math.floor(Math.random() * 8);
    }

    updatePreferences(success) {
        const adjustment = success ? this.learningRate : -this.learningRate;

        const direction = Math.floor(Math.random() * 8);
        this.preferences[direction] += adjustment;
        this.preferences = this.preferences.map(p => Math.max(p, 0));
        this.moveCount++;
    }

    isCloseToTrail(trailX, trailY, threshold) {
        const dx = this.x - trailX;
        const dy = this.y - trailY;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    }

    followTrailIfClose() {
        let bestLeader = null;
        let maxScore = -1;

        for (let walker of this.walkers) {
            if (walker !== this && walker.score > maxScore) {
                bestLeader = walker;
                maxScore = walker.score;
            }
        }

        if (!bestLeader) return;

        const leaderPath = bestLeader.path;
        if (leaderPath.length === 0) return;

        const leaderPosition = leaderPath[leaderPath.length - 1];
        if (!this.isCloseToTrail(leaderPosition.x, leaderPosition.y, 50)) return; // Follow if within 50px

        const distance = Math.sqrt((this.x - leaderPosition.x) ** 2 + (this.y - leaderPosition.y) ** 2);

        const stepSize = this.minStepSize + Math.random() * (this.maxStepSize - this.minStepSize);
        const angle = Math.atan2(leaderPosition.y - this.y, leaderPosition.x - this.x);

        this.x += stepSize * Math.cos(angle);
        this.y += stepSize * Math.sin(angle);

        this.x = Math.max(this.size, Math.min(this.canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.canvas.height - this.size, this.y));
    }
}
