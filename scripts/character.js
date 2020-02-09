// code generic to characters
class character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        this.mapReference = mapReference; // reference to the game map object; we will need to use it a lot

        // Create dom element for the character
        this.element = document.createElement('div');
        this.element.classList.add('character');

        // Attach to the game board
        this.mapReference.gameBoard.appendChild(this.element);

        // Move to start position
        this.moveTo(startColumn, startRow);

        // initial direction, no movement
        this.currentDirection = [0,0];

        // set stepsize based on time interval
        // assumes 1 tile per second as a starting default
        this.stepSize = timeInterval;
    }

    // Method to move a character to a specific location.
    // Note, I'm going by a column-first convention; since it corresponds to X coordinates.
    moveTo(column, row) {
        [this.column, this.row] = this.mapReference.keepOnMap([column, row]);
        const position = this.mapReference.elementPosition(this.column, this.row);
        this.element.style.left = `${position[0]}%`;
        this.element.style.top = `${position[1]}%`;
    }

    // Method to step in a direction. Includes checks for obstacles
    // Returns true on a successful step, and false on an unsuccessful or incomplete step.
    step() {
        const direction = this.currentDirection;
        const stepSize = this.stepSize;
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
            // if it doesn't work, bump to middle of cell along the axes of motion and return false
            const newPosition = [this.column, this.row];
            direction.forEach((axis,index) => {
                if (axis !== 0) {
                    newPosition[index] = Math.round(newPosition[index]);
                }
            });
            this.moveTo(newPosition[0], newPosition[1]);
            return false;
        }
    }

    doUpdate() {
        // if any of the directions are non-zero
        if (this.currentDirection.some((axis)=>axis)) {
            this.step();
        }
    }
}

export default character;