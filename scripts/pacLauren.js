import character from './character.js';

class pacLauren extends character {
    constructor(mapReference, startColumn, startRow) {
        super(mapReference, startColumn, startRow);
    }

    moveTo(column, row) {
        super.moveTo(column,row);
    }
}

export default pacLauren;