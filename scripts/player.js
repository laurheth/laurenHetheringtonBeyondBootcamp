import character from './character.js';

class player extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 10 * timeInterval;
        // "next direction", most recently requested by player input. Remember it until it becomes valid
        this.nextDirection = [0,0];
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

    doUpdate() {
        // Only significant difference is the player input stored in nextDirection. If it exists, and is valid, do it. Otherwise, just do the regular doUpdate.
        if (this.nextDirection.some((axis)=>axis)) {
            if(this.step([...this.nextDirection])) {
                // nextDirection is now the current direction
                this.currentDirection = [...this.nextDirection];
                this.nextDirection = [0,0];
                return;
            }
        }
        super.doUpdate();
    }
}

export default player;