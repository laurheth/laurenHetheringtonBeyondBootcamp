import character from './character.js';

class player extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.setSpeedFactors();
        this.poweredUp=false;
        this.poweredUpTimer = 0;
        this.powerUpDuration = 6;
        this.powerUpEndWarningTime = 2.5;
        this.captureGhostPointValue = 200;
        this.addToScore=null;
        this.dieFunction=null;
        this.element.classList.add('player');
        this.moveQueue = []; // move queue, used for gestures on mobile
        this.nextQueueDistance=0;
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

    setPowerUpTimes(powerTime, warningTime) {
        this.powerUpDuration = powerTime;
        this.powerUpEndWarningTime = warningTime;
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
        let eventCaptured=true;
        switch(event.key) {
            case 'SwipeRight':
            case 'ArrowRight':
                this.nextDirection = [1,0];
                break;
            case 'SwipeLeft':
            case 'ArrowLeft':
                this.nextDirection = [-1,0];
                break;
            case 'SwipeUp':
            case 'ArrowUp':
                this.nextDirection = [0, -1];
                break;
            case 'SwipeDown':
            case 'ArrowDown':
                this.nextDirection = [0,1];
                break;
            default:
                // Don't change anything
                eventCaptured=false;
                break;
        }
        if (eventCaptured) {
            event.preventDefault();
        }
    }

    doUpdate(timeInterval) {
        // Swipe queue logic
        if (this.nextDirection.some(x=>x)) {
            this.nextQueueDistance = this.distance + 0.9;
        }
        else if (this.moveQueue.length > 0 && this.distance >= this.nextQueueDistance) {
            this.nextDirection = this.moveQueue.shift();
        }

        // Generic doUpdate
        super.doUpdate(timeInterval);

        // Handle powerup timers
        if (this.poweredUp) {
            this.poweredUpTimer -= timeInterval;
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

    // Empty the move queue
    clearQueue() {
        this.nextDirection = [0,0];
        this.moveQueue = [];
        this.nextQueueDistance = this.distance;
    }

    // Add a move to the move queue
    addToQueue(move) {
        // If the movequeue is empty, or if the new move is different from the last move in the queue, append it to the queue
        if (this.moveQueue.length === 0 || this.moveQueue[this.moveQueue.length-1].some((x,i) => x !== move[i])) {
            this.moveQueue.push(move);
        }
    }
}

export default player;