// code generic to characters
class character {
    constructor(mapReference, startColumn, startRow) {
        this.mapReference = mapReference; // reference to the game map object; we will need to use it a lot

        // Create dom element for the character
        this.element = document.createElement('div');
        this.element.classList.add('character');

        // Attach to the game board
        this.mapReference.gameBoard.appendChild(this.element);

        // Move to start position
        this.moveTo(startColumn, startRow);
    }

    // Method to move a character to a specific location.
    // Note, I'm going by a column-first convention; it corresponds to X coordinates
    moveTo(column, row) {
        this.column = column;
        this.row = row;
        const position = this.mapReference.elementPosition(this.column, this.row);
        this.element.style.left = `${position[0]}%`;
        this.element.style.top = `${position[1]}%`;
    }

    // Method to step in a direction. Includes checks for obstacles
    // Returns true on a successful step, and false on an unsuccessful or incomplete step.
    step(direction, stepSize) {
        // check if the current position is even valid. If it's not, honestly, just let the step happen, something is fucked up. Let 👏 them 👏 be 👏 free!
        if (!this.mapReference.checkCollision(this.column,this.row)) {
            this.moveTo(this.column + direction[0]*stepSize, this.row + direction[1]*stepSize);
            return true;
        }

        // We know we're starting somewhere valid now. Are we GOING somewhere valid?
        // Check by a full tile increment; we don't want characters going directly against walls, we want them stopping in the middle of the pathway
        // This assumes stepsize is always smaller than 1, which, it should be! 1 tile per frame would be way faster than any PacLauren or Ghost should ever go.
        const testPosition = [this.column + direction[0],this.row + direction[1]];

        if (this.mapReference.checkCollision(testPosition[0],testPosition[1])) {
            // if it works, add the changes
            this.moveTo(this.column + stepSize * direction[0], this.row + stepSize * direction[1]);
            return true;
        }
        else {
            // if it doesn't work, bump to middle of cell and return false
            this.moveTo(Math.round(this.column), Math.round(this.row));
            return false;
        }
    }

}

export default character;