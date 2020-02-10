import character from './character.js';

class player extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 10 * timeInterval;
        this.setSpeedFactors();
    }

    setSpeedFactors(baseSpeed=0.8, powerUpSpeed=0.9, foodSpeed=0.8) {
        this.speedFactor = baseSpeed;
        this.baseSpeedFactor = baseSpeed;
        this.foodSpeedFactor = foodSpeed;
        this.powerUpSpeedFactor = powerUpSpeed;
    }

    newTile() {
        // reset speed factor
        this.speedFactor = this.baseSpeedFactor;
    }

    moveTo(column, row) {
        super.moveTo(column,row);
        const contentsTaken = this.mapReference.takeContents(column,row);
        if (contentsTaken) {
            if (contentsTaken === 'food') {
                this.speedFactor = this.baseSpeedFactor * this.foodSpeedFactor;
            }
        }
    }

    getEvent(event) {
        event.preventDefault();
        switch(event.key) {
            case 'ArrowRight':
                this.nextDirection = [1,0];
                break;
            case 'ArrowLeft':
                this.nextDirection = [-1,0];
                break;
            case 'ArrowUp':
                this.nextDirection = [0, -1];
                break;
            case 'ArrowDown':
                this.nextDirection = [0,1];
                break;
            default:
                // Don't change anything
                break;
        }
    }
}

export default player;