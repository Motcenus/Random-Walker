export class Walker {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = 5;
        this.color = '#ff0000';
        this.minStepSize = 2;
        this.maxStepSize = 10;
        this.path = [];
        this.maxPathLength = 1000;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.obstacles = [];
        this.obstacleCount = 50;
        this.obstacleSize = 20;
        this.generateObstacles();

        this.foods = [];
        this.foodCount = 10;
        this.foodSize = 15;
        this.generateFood();
    }

    generateObstacles() {
        this.obstacles.length = 0;
        for (let i = 0; i < this.obstacleCount; i++) {
            const x = Math.random() * (this.canvas.width - this.obstacleSize);
            const y = Math.random() * (this.canvas.height - this.obstacleSize);
            this.obstacles.push({ x, y });
        }
    }

    generateFood() {
        this.foods.length = 0;
        for (let i = 0; i < this.foodCount; i++) {
            const x = Math.random() * (this.canvas.width - this.foodSize);
            const y = Math.random() * (this.canvas.height - this.foodSize);
            this.foods.push({ x, y });
        }
    }

    drawFood() {
        this.ctx.fillStyle = '#00ff00'; // Food color
        this.foods.forEach(food => {
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, this.foodSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
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

    drawObstacles() {
        this.ctx.fillStyle = '#888888';
        this.obstacles.forEach(obstacle => {
            this.ctx.beginPath();
            this.ctx.rect(obstacle.x, obstacle.y, this.obstacleSize, this.obstacleSize);
            this.ctx.fill();
        });
    }

    detectCollision(x, y, size, items) {
        return items.some(item => {
            return x >= item.x && x <= item.x + size &&
                   y >= item.y && y <= item.y + size;
        });
    }

    move() {
        this.path.push({ x: this.x, y: this.y });

        if (this.path.length > this.maxPathLength) {
            this.path.shift();
        }

        const stepSize = this.minStepSize + Math.random() * (this.maxStepSize - this.minStepSize);
        const direction = Math.floor(Math.random() * 8);
        let newX = this.x;
        let newY = this.y;

        switch(direction) {
            case 0: newX += stepSize; break;
            case 1: newX -= stepSize; break;
            case 2: newY += stepSize; break;
            case 3: newY -= stepSize; break;
            case 4: newX += stepSize; newY += stepSize; break;
            case 5: newX -= stepSize; newY -= stepSize; break;
            case 6: newX += stepSize; newY -= stepSize; break;
            case 7: newX -= stepSize; newY += stepSize; break;
        }

        if (!this.detectCollision(newX, newY, this.size, this.obstacles)) {
            this.x = newX;
            this.y = newY;
        }

        if (this.detectCollision(this.x, this.y, this.foodSize, this.foods)) {
            this.foods = this.foods.filter(food => !(this.x >= food.x && this.x <= food.x + this.foodSize &&
                                                    this.y >= food.y && this.y <= food.y + this.foodSize));
        }

        this.x = Math.max(this.size, Math.min(this.canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.canvas.height - this.size, this.y));
    }
}
