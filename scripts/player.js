import character from './character.js';

class player extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 10 * timeInterval;
        this.setSpeedFactors();
        this.poweredUp=false;
        this.poweredUpTimer = 0;
        this.powerUpDuration = 6;
        this.powerUpEndWarningTime = 2.5;
        this.captureGhostPointValue = 200;
        this.addToScore=null;
        this.dieFunction=null;
        this.element.classList.add('player');
    }

    setSpeedFactors(baseSpeed=0.8, powerUpSpeed=0.9, foodSpeed=0.87) {
        this.speedFactor = baseSpeed;
        this.baseSpeedFactor = baseSpeed;
        this.foodSpeedFactor = foodSpeed;
        this.powerUpSpeedFactor = powerUpSpeed;
    }

    determineSpeedFactor() {
        // reset speed factor
        if (this.poweredUp) {
            this.speedFactor = this.powerUpSpeedFactor;
        }
        else {
            this.speedFactor = this.baseSpeedFactor;
        }
    }

    moveTo(column, row) {
        super.moveTo(column,row);

        // Grab contents from the map
        const contentsTaken = this.mapReference.takeContents(column,row);
        if (contentsTaken) {
            // om nom food
            if (contentsTaken === 'food') {
                this.speedFactor *= this.foodSpeedFactor;
                if (this.addToScore) {this.addToScore(10);}
            }
            // power up! om nom ghosts!
            else if (contentsTaken === 'powerUp') {
                this.powerUp();
                if (this.addToScore) {this.addToScore(50);}
            }
        }
    }

    powerUp() {
        this.poweredUp=true;
        this.poweredUpTimer += this.powerUpDuration;
        this.mapReference.ghostRefs.forEach(ghost => ghost.makeAfraid(true));
    }

    powerDown() {
        this.captureGhostPointValue = 200;
        this.poweredUp = false;
        this.mapReference.ghostRefs.forEach(ghost => ghost.makeAfraid(false));
    }

    getEvent(event) {
        event.preventDefault();
        switch(event.key) {
            case 'ArrowRight':
                this.nextDirection = [1,0];
                break;
            case 'ArrowLeft':
                this.nextDirection = [-1,0];
                break;
            case 'ArrowUp':
                this.nextDirection = [0, -1];
                break;
            case 'ArrowDown':
                this.nextDirection = [0,1];
                break;
            default:
                // Don't change anything
                break;
        }
    }

    doUpdate() {
        super.doUpdate();
        if (this.poweredUp) {
            this.poweredUpTimer -= this.timeInterval;
            if (this.poweredUpTimer <= 0) {
                this.poweredUpTimer=0;
                this.powerDown();
            } else if (this.poweredUpTimer <= this.powerUpEndWarningTime) {
                this.mapReference.ghostRefs.forEach((ghost) => {
                    ghost.activateWarning();
                });
            }
        }
    }

    // Method to check for collisions with ghosts
    checkGhostCollision() {
        let playerDies=false;
        this.mapReference.ghostRefs.filter(ghost=>ghost).forEach((ghost) => {
            if (Math.round(ghost.column) === Math.round(this.column) &&
            Math.round(ghost.row) === Math.round(this.row)) {
                if (ghost.afraid || ghost.captured) {
                    if (!ghost.captured) {
                        if (this.addToScore) {
                            this.addToScore(this.captureGhostPointValue);
                        }
                        this.captureGhostPointValue*=2;
                        ghost.capture();
                    }
                }
                else {
                    playerDies = true;
                }
            }
        });

        if (playerDies && this.dieFunction) {
            this.dieFunction();
            return;
        }
    }

    reset() {
        this.moveTo(13.5,23);
        this.nextDirection=[0,0];
        this.currentDirection=[0,0];
    }

}

export default player;