class fruit {
    constructor(symbol, points, mapReference) {
        this.column = 13.5;
        this.row = 17;
        this.symbol = symbol;
        this.points = points;
        this.fruitTimer = 9 + Math.random(); // 9 to 10 seconds

        // Create dom element for the fruit
        this.element = document.createElement('div');
        this.element.classList.add('fruit');
        this.element.textContent = this.symbol;

        // figure out element position
        const position = mapReference.elementPosition(this.column, this.row);
        this.element.style.left = `${position[0]}%`;
        this.element.style.top = `${position[1]}%`;

        // Attach to the game board
        mapReference.gameBoard.appendChild(this.element);
    }

    checkFruitCollision(position) {
        return (Math.abs(position[0]-this.column) + Math.abs(position[1]-this.row) < 0.5);
    }

    getFruit() {
        this.removeFruit();
        return this.points;
    }
    
    removeFruit() {
        this.element.remove();
    }

    incrementTime(timeInterval) {
        this.fruitTimer -= timeInterval;
        if (this.fruitTimer < 0) {
            this.removeFruit();
            return false;
        }
        return true;
    }
}

export default fruit;