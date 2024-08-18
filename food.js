export class Food {
    constructor(canvas, size, numberOfFood) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.foodSize = size;
        this.foods = [];
        this.maxCollisions = 3; // Number of collisions before food disappears

        this.initFood(numberOfFood);
    }

    initFood(numberOfFood) {
        for (let i = 0; i < numberOfFood; i++) {
            this.foods.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`, // Semi-transparent
                collisions: 0
            });
        }
    }

    drawFood() {
        this.ctx.globalCompositeOperation = 'lighter'; // Blend mode for color bleeding
        this.foods.forEach(food => {
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, this.foodSize, 0, Math.PI * 2);
            this.ctx.fillStyle = food.color;
            this.ctx.fill();
        });
        this.ctx.globalCompositeOperation = 'source-over'; // Reset blend mode
    }

    getFoodItems() {
        return this.foods;
    }

    updateFoodStatus() {
        // Remove food that has reached the collision threshold
        this.foods = this.foods.filter(food => food.collisions < this.maxCollisions);
    }
}
