import character from './character.js';

class ghost extends character {
    constructor(mapReference, startColumn, startRow, timeInterval, ghostType) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 10 * timeInterval;
        this.targetTile = [0,0];
        this.ghostType = ghostType;
        this.setSpeedFactors();
        this.element.classList.add(ghostType+'Ghost');
        switch(ghostType) {
            default:
            case 'pink':
                this.scatterTile = [1, 0];
                break;
            case 'red':
                this.scatterTile = [this.mapReference.dimensions[0]-2,0];
                break;
            case 'orange':
                this.scatterTile = [0, this.mapReference.dimensions[1]-1];
                break;
            case 'blue':
                this.scatterTile = [this.mapReference.dimensions[0]-1, this.mapReference.dimensions[1]-1];
                break;
        }
        this.newTile();
    }
    setSpeedFactors(baseSpeed = 0.75, scaredSpeed = 0.5, tunnelSpeed = 0.4) {
        this.speedFactor = baseSpeed;
        this.baseSpeedFactor = baseSpeed;
        this.scaredSpeedFactor = scaredSpeed;
        this.tunnelSpeedFactor = tunnelSpeed;
    }

    newTile() {
        // Determine current speed factor
        if (this.mapReference.checkTunnel(this.column, this.row)) {
            this.speedFactor = this.tunnelSpeedFactor;
        }
        else {
            this.speedFactor = this.baseSpeedFactor;
        }

        // Determine next direction
        this.chooseTarget();
        const possibleDirections = [[1,0],[-1,0],[0,1],[0,-1]];
        const directionDistances = possibleDirections.map((direction) => {
            // If direction = -currentDirection, it's invalid. Cannot reverse except for during AI state change
            if ((Math.abs(direction[0] + this.currentDirection[0]) + Math.abs(direction[1] + this.currentDirection[1])) === 0) {
                return Infinity;
            }
            // If direction is blocked, cannot go that way
            else if (!this.mapReference.checkCollision(this.column + direction[0], this.row + direction[1])) {
                return Infinity;
            }
            else {
                return Math.abs(this.column + direction[0] - this.targetTile[0])**2 + Math.abs(this.row + direction[1] - this.targetTile[1])**2;
            }
        });
        // Whichever direction is closest to target tile, take it!
        const minIndex = directionDistances.indexOf(Math.min(...directionDistances));
        this.nextDirection = possibleDirections[minIndex];
    }

    // The principal difference between the ghost's is how they choose their target tile. That logic is performed here
    chooseTarget() {
        const playerRef = this.mapReference.playerRef;
        switch(this.ghostType) {
            // Default, and red ghost, "Blinky". Chases directly after player
            default:
            case 'red':
                this.targetTile = [playerRef.column, playerRef.row];
                break;
            // Pink ghost, "Pinky". Aims 4 tiles in front of player to try and ambush them
            case 'pink':
                this.targetTile = [playerRef.column + 4*playerRef.currentDirection[0], playerRef.row + 4*playerRef.currentDirection[1]];
                break;
            // Orange ghost, "Clyde". Chases player, unless they get too close, then hides in the corner
            case 'orange':
                const distanceToPlayerSquared = (this.column - playerRef.column)**2 + (this.row - playerRef.row)**2;
                if (distanceToPlayerSquared > 64) {
                    this.targetTile = [playerRef.column, playerRef.row];
                }
                else {
                    this.targetTile = this.scatterTile;
                }
                break;
            // Blue ghost, "Inky". Tries to be opposite of the red ghost's position, kinda
            // Takes a point 2 tiles in front of the player, and draws a vector from the red ghost to that point.
            // Then, doubles the length of that vector.
            // The point that lands is the blue ghosts target
            case 'blue':
                console.log(this.mapReference.ghostRefs);
                const redRef = this.mapReference.ghostRefs[0];
                this.targetTile = [
                    redRef.column + 2 * (playerRef.column + 2*playerRef.currentDirection[0] - redRef.column),
                    redRef.row + 2 * (playerRef.row + 2*playerRef.currentDirection[1] - redRef.row)
                ]
        }
    }
}

export default ghost;