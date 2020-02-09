import character from './character.js';

class player extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 5 * timeInterval;
    }

    moveTo(column, row) {
        super.moveTo(column,row);
        this.mapReference.takeContents(column,row);
    }

    getEvent(event) {
        event.preventDefault();
        switch(event.key) {
            case 'ArrowRight':
                this.currentDirection = [1,0];
                break;
            case 'ArrowLeft':
                this.currentDirection = [-1,0];
                break;
            case 'ArrowUp':
                this.currentDirection = [0, -1];
                break;
            case 'ArrowDown':
                this.currentDirection = [0,1];
                break;
            default:
                // Don't change anything
                break;
        }
    }

    update() {

    }
}

export default player;