export class Walker {
    constructor(canvas, food, color = '#ff0000') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = 5;
        this.color = color;
        this.path = [];
        this.maxPathLength = 1000;
        this.hunger = 100;
        this.hungerDecreaseRate = 0.05;
        this.hungerThreshold = 30;
        this.learningRate = 0.1;
        this.currentAngle = Math.random() * 2 * Math.PI;
        this.angleChangeRate = 0.5;
        this.maxStraightLineLength = 10;
        this.straightLineCounter = 0;
        this.boundaryBuffer = 20;
        this.score = 0;
        this.preferences = Array(8).fill(1);
        this.moveCount = 0;
        this.startTime = Date.now();
    }

    drawWalker() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    drawPath() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color; // Use the walker's color
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

        const stepSize = this.hunger < this.hungerThreshold ? 5 : 2 + Math.random() * 3; // Random step size
        const angleChange = (Math.random() - 0.5) * this.angleChangeRate;
        this.currentAngle += angleChange;

        let newX = this.x + stepSize * Math.cos(this.currentAngle);
        let newY = this.y + stepSize * Math.sin(this.currentAngle);

        const edgeBuffer = this.size + this.boundaryBuffer;
        const rightEdge = this.canvas.width - edgeBuffer;
        const bottomEdge = this.canvas.height - edgeBuffer;

        if (newX < edgeBuffer) {
            newX = edgeBuffer;
            this.currentAngle = Math.random() * Math.PI + Math.PI;
        } else if (newX > rightEdge) {
            newX = rightEdge;
            this.currentAngle = Math.random() * Math.PI;
        }

        if (newY < edgeBuffer) {
            newY = edgeBuffer;
            this.currentAngle = Math.random() * (Math.PI / 2) + (3 * Math.PI / 2);
        } else if (newY > bottomEdge) {
            newY = bottomEdge;
            this.currentAngle = Math.random() * (Math.PI / 2) + (Math.PI / 2);
        }

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

    followTrailIfClose(leader, threshold) {
        if (leader.path.length === 0) return;

        let closestTrail = null;
        let minDistance = Infinity;

        for (let otherWalker of leader.path) {
            if (otherWalker.score <= this.score) continue;

            const distance = Math.sqrt(
                (this.x - otherWalker.x) ** 2 + (this.y - otherWalker.y) ** 2
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestTrail = otherWalker;
            }
        }

        if (closestTrail && minDistance < threshold) {
            const angle = Math.atan2(closestTrail.y - this.y, closestTrail.x - this.x);
            const stepSize = 2 + Math.random() * 3;

            this.x += stepSize * Math.cos(angle);
            this.y += stepSize * Math.sin(angle);

            this.x = Math.max(this.size, Math.min(this.canvas.width - this.size, this.x));
            this.y = Math.max(this.size, Math.min(this.canvas.height - this.size, this.y));
        }
    }
}
