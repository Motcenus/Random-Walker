export class Food {
    constructor(canvas, foodSize = 15, numberOfFood = 10) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.foodSize = foodSize;
        this.numberOfFood = numberOfFood;
        this.foods = [];
        this.initializeFood();
    }

    initializeFood() {
        this.foods.length = 0;
        for (let i = 0; i < this.numberOfFood; i++) {
            const x = Math.random() * (this.canvas.width - this.foodSize);
            const y = Math.random() * (this.canvas.height - this.foodSize);
            this.foods.push({ x, y });
        }
    }

    drawFood() {
        this.ctx.fillStyle = '#00ff00';
        this.foods.forEach(food => {
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, this.foodSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    getFoodItems() {
        return this.foods;
    }
}
