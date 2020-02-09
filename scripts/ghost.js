import character from './character.js';

class ghost extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 3 * timeInterval;
    }
}

export default ghost;