class touchHandler {
    constructor(element, playerRef) {
        this.playerRef = playerRef;

        this.reset();

        this.minLength = 20; // pixels
        this.minSpeed = 400; // pixels per second
        this.ratioNeeded = 1.2; // Diagonal swipes are ambiguous! Ratio needed for clarity

        element.addEventListener("touchstart", (event) => this.handleStart(event),true);
        element.addEventListener("touchmove", (event) => this.handleMove(event), true);
        element.addEventListener("touchend", (event) => this.handleEnd(event), true);
    }

    handleStart(event) {
        event.preventDefault();

        this.reset();
        this.playerRef.clearQueue();

        const touch = event.changedTouches[0];
        this.lastPos = [touch.pageX, touch.pageY]; // store where the swipe started
        this.startTime = (new Date()).getTime();

        console.log('---');
    }

    handleMove(event) {
        event.preventDefault();
        const touch = event.changedTouches[0];
        const newPos = [touch.pageX, touch.pageY]; // store where the swipe is

        this.delta[0] += newPos[0] - this.lastPos[0];
        this.delta[1] += newPos[1] - this.lastPos[1];

        this.lastPos = newPos;

        if (Math.abs(this.delta[0] / this.delta[1]) > this.ratioNeeded && Math.abs(this.delta[0]) > this.minLength) {
            if (this.delta[0] > 0) {
                this.sendSwipe('swipeRight');
            }
            else {
                this.sendSwipe('swipeLeft');
            }
        }
        else if (Math.abs(this.delta[1] / this.delta[0]) > this.ratioNeeded && Math.abs(this.delta[1]) > this.minLength) {
            if (this.delta[1] > 0) {
                this.sendSwipe('swipeDown');
            }
            else {
                this.sendSwipe('swipeUp');
            }
        }
    }

    handleEnd(event) {
        event.preventDefault();
    }

    reset() {
        // Reset numbers
        this.lastPos = null;
        this.startTime = null;
        this.delta = [0,0];
    }

    // Easiest way seems to me to just build a custom event object and send it the same place keys go (stored in callback)
    sendSwipe(swipeString) {
        // console.log(swipeString);
        this.delta = [0,0];
        const newMove = [0,0];
        switch(swipeString) {
            default:
                break;
            case 'swipeLeft':
                newMove[0] = -1;
                break;
            case 'swipeRight':
                newMove[0] = 1;
                break;
            case 'swipeUp':
                newMove[1] = -1;
                break;
            case 'swipeDown':
                newMove[1] = 1;
                break;
        }
        this.playerRef.addToQueue(newMove);
    }
}

export default touchHandler;