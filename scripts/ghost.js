import character from './character.js';

class ghost extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 10 * timeInterval;
        this.targetTile = [0,0];
        this.setSpeedFactors();
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
}

export default ghost;