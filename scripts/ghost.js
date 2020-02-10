import character from './character.js';

class ghost extends character {
    constructor(mapReference, startColumn, startRow, timeInterval) {
        super(mapReference, startColumn, startRow, timeInterval);
        this.stepSize = 10 * timeInterval;
        
    }
    setSpeedFactors(baseSpeed = 0.75, scaredSpeed = 0.5, tunnelSpeed = 0.4) {
        this.speedFactor = baseSpeed;
        this.baseSpeedFactor = baseSpeed;
        this.scaredSpeedFactor = scaredSpeed;
        this.tunnelSpeedFactor = tunnelSpeed;
    }

    newTile() {
        if (this.mapReference.checkTunnel(this.column, this.row)) {
            this.speedFactor = this.tunnelSpeedFactor;
        }
        else {
            this.speedFactor = this.speedFactor;
        }
    }
}

export default ghost;