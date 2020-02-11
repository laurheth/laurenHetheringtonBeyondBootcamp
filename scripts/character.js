// code generic to characters
class character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        this.mapReference = mapReference; // reference to the game map object; we will need to use it a lot

        // Create dom element for the character
        this.element = document.createElement('div');
        this.element.classList.add('character');

        // Attach to the game board
        this.mapReference.gameBoard.appendChild(this.element);

        // Keep track of the current tile index. Used for some logic in speed changes, such as from eating pellets, entering the tunnel, etc.
        this.tileIndex=this.mapReference.tileIndex(startColumn,startRow);

        
        // initial direction, no movement
        this.currentDirection = [0,0];
        // next direction, used to plan ahead and in logic to turn corners bit more smoothly
        this.nextDirection = [0,0];

        // Move to start position
        this.moveTo(startColumn, startRow);

        // set stepsize based on time interval
        // assumes 1 tile per second as a starting default
        this.stepSize = timeInterval;
        // Remember the time interval
        this.timeInterval = timeInterval;

        // Speed factor, to adjust for various circumstances
        this.speedFactor = 1;
    }

    // Method to move a character to a specific location.
    // Note, I'm going by a column-first convention; since it corresponds to X coordinates.
    moveTo(column, row) {
        [this.column, this.row] = this.mapReference.keepOnMap([column, row]);
        // console.log(column, row);

        const position = this.mapReference.elementPosition(this.column, this.row);
        this.element.style.left = `${position[0]}%`;
        this.element.style.top = `${position[1]}%`;

        // New tile, do some new tile logic
        const newTileIndex = this.mapReference.tileIndex(this.column,this.row);
        if (newTileIndex !== this.tileIndex) {
            this.tileIndex = newTileIndex;
            this.newTile();
        }
    }

    // this is a stub. New tile logic is specific to ghosts and the player
    newTile() {
        // do nothing
    }

    // Method to step in a direction. Includes checks for obstacles
    // Returns true on a successful step, and false on an unsuccessful or incomplete step.
    step(direction,ignoreCollisions=false) {
        const stepSize = this.speedFactor * this.stepSize;
        // check if the current position is even valid. If it's not, honestly, just let the step happen, something is fucked up. Let 👏 them 👏 be 👏 free!
        if (ignoreCollisions || !this.mapReference.checkCollision(this.column,this.row)) {
            this.moveTo(this.column + direction[0]*stepSize, this.row + direction[1]*stepSize);
            return true;
        }

        // We know we're starting somewhere valid now. Are we GOING somewhere valid?
        // Check by a full tile increment; we don't want characters going directly against walls, we want them stopping in the middle of the pathway
        // This assumes stepsize is always smaller than 1, which, it should be! 1 tile per frame would be way faster than any PacLauren or Ghost should ever go.
        const testPosition = [this.column + 0.75*direction[0],this.row + 0.75*direction[1]];
        let newPosition = [this.column, this.row];
        let successfulStep=false;

        if (this.mapReference.checkCollision(testPosition[0],testPosition[1])) {
            // if it works, we know the direction of motion is valid, but we aren't done yet
            // It's easy to turn too soon or too late and be stuck near the edge of a corridor
            // Maybe move towards center of corridor before applying the step?

            // First, check which axis is zero, and check current position
            const zeroIndex = direction.indexOf(0);
            const oneIndex = (zeroIndex+1) % 2;
            if (zeroIndex >= 0) {
                const positionError = newPosition[zeroIndex] - Math.round(newPosition[zeroIndex]);
                // The position error is larger than the stepsize! In this case, only move to correct the error
                if (Math.abs(positionError) > stepSize) {
                    direction[oneIndex] = 0;
                    direction[zeroIndex] = -Math.sign(positionError);
                }
                // The position error is smaller, so a partial correction is fine
                else {
                    direction[zeroIndex] = -positionError / stepSize;
                    direction[oneIndex] = Math.sign(direction[oneIndex]) * (1 - Math.abs(direction[zeroIndex]));
                }
            }

            newPosition = [this.column + stepSize * direction[0], this.row + stepSize * direction[1]];
            successfulStep = true;
        }
        else {
            // if it doesn't work, bump to middle of cell along the axes of motion and return false
            direction.forEach((axis,index) => {
                if (axis !== 0) {
                    newPosition[index] = Math.round(newPosition[index]);
                }
            });
        }
        this.moveTo(newPosition[0], newPosition[1]);
        return successfulStep;
    }

    doUpdate() {
        // If nextDirection is nonzero, give it a try
        if (this.nextDirection.some((axis)=>axis)) {
            if(this.step([...this.nextDirection])) {
                // nextDirection is now the current direction
                this.currentDirection = [...this.nextDirection];
                this.nextDirection = [0,0];
                return;
            }
        }
        // if any of the directions are non-zero
        if (this.currentDirection.some((axis)=>axis)) {
            this.step([...this.currentDirection]);
        }
    }
}

export default character;