import character from './character.js';

class ghost extends character {
    constructor(mapReference, startColumn, startRow, ghostType) {
        super(mapReference, startColumn, startRow);
        this.targetTile = [0,0];
        this.ghostType = ghostType;

        this.initialLocation = [startColumn, startRow];

        this.freeFromHouseThreshold = 0; // number of foods to be eaten before it is free
        this.danceMovesToGo = 6; // minimum number of dance bounces
        this.freeFromHouse = false;
        this.scatterMode=true;
        this.houseDanceDirection = 1;
        this.houseDanceBounds = [14.5, 13.5];
        this.houseExit = [13.5,11];

        this.afraid=false;

        this.captured=false;
        this.warningActive=false;

        // "Cruise Elroy" mode. When fewer than these numbers of foods are present, the red ghost goes faster
        this.elroyMode = -2;

        this.setSpeedFactors();
        this.element.classList.add(ghostType+'Ghost');
        switch(ghostType) {
            default:
            case 'pink':
                this.scatterTile = [3, -3];
                break;
            case 'red':
                this.scatterTile = [this.mapReference.dimensions[0]-4,-3];
                break;
            case 'orange':
                this.scatterTile = [0, this.mapReference.dimensions[1]+3];
                break;
            case 'blue':
                this.scatterTile = [this.mapReference.dimensions[0]-1, this.mapReference.dimensions[1]+2];
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
        super.newTile();
        
        // Only do this logic if outside of the house
        if (this.freeFromHouse) {
            // Determine next direction
            this.determineNextDirection();
        }
    }

    // Determine the next direction to travel in
    determineNextDirection() {
        this.chooseTarget();
        const startPosition = [Math.round(this.column), Math.round(this.row)];
        const targetPosition = this.targetTile.map(x=>Math.round(x));

        const possibleDirections = [[1,0],[-1,0]];
        if (this.mapReference.checkVerticalMovementAllowed(...startPosition) || this.captured) {
            possibleDirections.push([0,1]);
            possibleDirections.push([0,-1]);
        }
        const directionDistances = possibleDirections.map((direction) => {
            const exitPosition = startPosition.map((x,i) => x + direction[i]);
            // If direction = -currentDirection, it's invalid. Cannot reverse except for during AI state change
            if ((Math.abs(direction[0] + this.currentDirection[0]) + Math.abs(direction[1] + this.currentDirection[1])) === 0) {
                return Infinity;
            }
            // If direction is blocked, cannot go that way
            else if (!this.mapReference.checkCollision(...exitPosition)) {
                return Infinity;
            }
            else {
                return Math.abs(exitPosition[0] - targetPosition[0])**2 + Math.abs(exitPosition[1] - targetPosition[1])**2;
            }
        });

        if (!this.afraid || this.captured) {
            // Whichever direction is closest to target tile, take it!
            const minIndex = directionDistances.indexOf(Math.min(...directionDistances));
            this.nextDirection = possibleDirections[minIndex];
        }
        else {
            const acceptableOptions = possibleDirections.filter((direction, index) => isFinite(directionDistances[index]));
            if (acceptableOptions.length > 1) {
                this.nextDirection = acceptableOptions[Math.floor(acceptableOptions.length * Math.random())];
            }
            else {
                this.nextDirection = acceptableOptions[0];
            }
        }
    }

    // Determine current speed factor
    determineSpeedFactor() {
        if (!this.freeFromHouse) {
            this.speedFactor = this.tunnelSpeedFactor;
        }
        else {
            if (this.captured) {
                this.speedFactor = 1.5;
            }
            else if (this.mapReference.checkTunnel(this.column, this.row)) {
                this.speedFactor = this.tunnelSpeedFactor;
            }
            else if (this.afraid) {
                this.speedFactor = this.scaredSpeedFactor;
            }
            else {
                this.speedFactor = this.baseSpeedFactor;
            }
            // increase speed for "Cruise Elroy" mode.
            if (this.mapReference.foodTotal - this.mapReference.foodEaten < this.elroyMode) {
                this.speedFactor += 0.05;
                if (this.mapReference.foodTotal - this.mapReference.foodEaten < this.elroyMode/2) {
                    this.speedFactor += 0.05;
                }
            }
        }
    }

    // The principal difference between the ghost's is how they choose their target tile. That logic is performed here
    chooseTarget() {
        // Has been captured, return home!
        if (this.captured) {
            this.targetTile = this.houseExit;
            if ((Math.abs(this.column - this.houseExit[0]) + Math.abs(this.row - this.houseExit[1])) < 1) {
                this.release();
            }
        }
        // If in scatter mode, go to scatter target
        else if (this.scatterMode) {
            this.targetTile = this.scatterTile;
        }
        // Otherwise, do default, player hunting behavior
        else {
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
                // That is the blue ghosts target. Functionally a fancier approach to ambushing
                case 'blue':
                    const redRef = this.mapReference.ghostRefs[0];
                    this.targetTile = [
                        redRef.column + 2 * (playerRef.column + 2*playerRef.currentDirection[0] - redRef.column),
                        redRef.row + 2 * (playerRef.row + 2*playerRef.currentDirection[1] - redRef.row)
                    ]
            }
        }
    }

    // Update logic, mainly for escaping from the house
    doUpdate(timeInterval) {
        // Do normal activity
        if (this.freeFromHouse) {
            super.doUpdate(timeInterval);
        }
        // Time to leave the house!
        else if (this.mapReference.foodEaten >= this.freeFromHouseThreshold && this.danceMovesToGo <= 0) {
            // Free from the house, begin regular activity
            if (Math.abs(this.column - this.houseExit[0]) + Math.abs(this.row - this.houseExit[1]) === 0) {
                this.freeFromHouse=true;
                this.newTile();
                super.doUpdate(timeInterval);
            }
            // Move to leave the house
            else if (Math.abs(this.column - this.houseExit[0]) >= this.baseSpeed * timeInterval) {
                this.step([Math.sign(this.houseExit[0] - this.column), 0], timeInterval);
            }
            else if (Math.abs(this.row - this.houseExit[1]) >= this.baseSpeed * timeInterval) {
                this.step([0, Math.sign(this.houseExit[1] - this.row)], timeInterval);
            }
            else {
                this.moveTo(this.houseExit[0], this.houseExit[1]);
            }
        }
        // Dance inside the house, it's not time to leave yet
        else {
            if (this.row > this.houseDanceBounds[0] && this.houseDanceDirection>0) {
                this.houseDanceDirection=-1;
                this.danceMovesToGo--;
            }
            else if (this.row < this.houseDanceBounds[1] && this.houseDanceDirection<0) {
                this.houseDanceDirection=1;
                this.danceMovesToGo--;
            }
            this.step([0, this.houseDanceDirection],timeInterval, true);
        }
    }

    // Reverse direction
    reverseDirection() {
        this.currentDirection = this.currentDirection.map(x=>-x);
        this.newTile();
    }

    reset() {
        this.makeAfraid(false);
        this.moveTo(...this.initialLocation);
        this.freeFromHouse=false;
        if (this.ghostType === 'red') {
            this.danceMovesToGo=-1;
        }
        else if (this.ghostType === 'pink') {
            this.danceMovesToGo=6;
        }
        else if (this.ghostType === 'blue') {
            this.danceMovesToGo=12;
        }
        else {
            this.danceMovesToGo=18;
        }
        this.scatterMode=true;
        this.currentDirection=[0,0];
    }

    makeAfraid(afraid) {
        this.afraid = afraid;
        this.deactivateWarning();
        if (afraid) {
            this.reverseDirection();
            this.element.classList.add('afraid');
        }
        else {
            this.element.classList.remove('afraid');
        }
    }

    activateWarning() {
        if (!this.warningActive) {
            this.element.classList.add('endWarning');
            this.warningActive=true;
        }
    }

    deactivateWarning() {
        this.element.classList.remove('endWarning');
        this.warningActive=false;
    }

    capture() {
        this.captured=true;
        this.makeAfraid(false);
        this.element.classList.add('captured');
    }

    release() {
        this.captured=false;
        this.houseDanceDirection = 1;
        this.danceMovesToGo = 1;
        this.freeFromHouse=false;
        this.element.classList.remove('captured');
    }
}

export default ghost;