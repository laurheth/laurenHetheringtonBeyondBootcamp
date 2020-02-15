// code generic to characters
class character {
    constructor(mapReference, startColumn, startRow) {
        this.mapReference = mapReference; // reference to the game map object; we will need to use it a lot

        // Create dom element for the character
        this.element = document.createElement('div');
        this.element.classList.add('character','movingRight');

        // Attach to the game board
        this.mapReference.gameBoard.appendChild(this.element);

        // Keep track of the current tile index. Used for some logic in speed changes, such as from eating pellets, entering the tunnel, etc.
        this.tileIndex=this.mapReference.tileIndex(startColumn,startRow);

        
        // initial direction, no movement
        this.currentDirection = [0,0];
        // next direction, used to plan ahead and in logic to turn corners bit more smoothly
        this.nextDirection = [0,0];

        // Base speed in tiles per second, which will be modified by various speed factors later.
        this.baseSpeed = 10;
        
        // Speed factor, to adjust for various circumstances
        this.speedFactor = 1;
        
        // Set the element size
        this.elementGrowthFactor = 1.25;
        this.element.style.width = `${this.elementGrowthFactor*this.mapReference.elementWidth()}%`;
        this.element.style.height = `${this.elementGrowthFactor*this.mapReference.elementHeight()}%`;
        
        this.elementPositionFactor = 100 / this.elementGrowthFactor;
        this.elementOffset = 100 * (this.elementGrowthFactor - 1) / 4

        // Move to start position
        this.moveTo(startColumn, startRow);
    }

    // Method to move a character to a specific location.
    // Note, I'm going by a column-first convention; since it corresponds to X coordinates.
    moveTo(column, row) {
        [this.column, this.row] = this.mapReference.keepOnMap([column, row]);
        
        this.element.style.transform = `translate(${this.column * this.elementPositionFactor - this.elementOffset}%, ${this.row * this.elementPositionFactor - this.elementOffset}%)`;

        // Check if the character has entered a new tile. If so, do some new tile logic
        const newTileIndex = this.mapReference.tileIndex(this.column,this.row);
        if (newTileIndex !== this.tileIndex) {
            this.tileIndex = newTileIndex;
            this.newTile();
        }
    }

    // Code to run every time a character enters a new tile
    newTile() {
        // Is there a collision between the player and the ghosts?
        this.mapReference.playerRef.checkGhostCollision();
        // How fast should the character go?
        this.determineSpeedFactor();
    }

    // Stub, to be overridden by ghost and player
    determineSpeedFactor() {
        this.speedFactor=1;
    }

    // Method to step in a direction. Includes checks for obstacles
    // Returns true on a successful step, and false on an unsuccessful or incomplete step.
    step(direction,timeInterval,ignoreCollisions=false) {

        const stepSize = this.speedFactor * this.baseSpeed * timeInterval;
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

        // Update character position
        this.moveTo(newPosition[0], newPosition[1]);

        return successfulStep;
    }

    elementDirection(direction) {
        this.element.classList.remove('movingRight', 'movingLeft','movingUp', 'movingDown');
        if (direction[1]>0) {
            this.element.classList.add('movingDown');
        }
        else if (direction[1]<0) {
            this.element.classList.add('movingUp');
        }
        else if (direction[0]<0) {
            this.element.classList.add('movingLeft');
        }
        else {
            this.element.classList.add('movingRight');
        }
    }

    animateMovement(animate) {
        if (animate) {
            this.element.classList.add('moving');
        }
        else {
            this.element.classList.remove('moving');
        }
    }

    doUpdate(timeInterval) {
        // If nextDirection is nonzero, give it a try
        if (this.nextDirection.some((axis)=>axis)) {
            if(this.step([...this.nextDirection],timeInterval)) {
                // nextDirection is now the current direction
                this.currentDirection = [...this.nextDirection];
                this.nextDirection = [0,0];
                // Update element direction and turn on animation; a new direction has been successfully chosen!
                this.elementDirection(this.currentDirection);
                this.animateMovement(true);
                return;
            }
        }
        // if any of the directions are non-zero
        if (this.currentDirection.some((axis)=>axis)) {
            if(!this.step([...this.currentDirection],timeInterval)) {
                // No new direction (demonstrated above) and the current direction has hit a wall. Character is stopping, so stop movement animation.
                this.animateMovement(false);
            }
        }
    }
}

export default character;