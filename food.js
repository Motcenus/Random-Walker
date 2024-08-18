export class Food {
    constructor(canvas, size, numberOfFood) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = size;
        this.foodSize = size;
        this.maxCollisions = 5; // Maximum number of collisions before food disappears
        this.foods = this.createFoodItems(numberOfFood);
    }

    createFoodItems(numberOfFood) {
        const foodItems = [];
        for (let i = 0; i < numberOfFood; i++) {
            foodItems.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                collisions: 0
            });
        }
        return foodItems;
    }

    drawFood() {
        this.ctx.fillStyle = 'green';
        this.foods.forEach(food => {
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, this.foodSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    updateFoodStatus() {
        // Remove food that has reached the maximum number of collisions
        this.foods = this.foods.filter(food => food.collisions < this.maxCollisions);
    }

    getFoodItems() {
        return this.foods;
    }
}
