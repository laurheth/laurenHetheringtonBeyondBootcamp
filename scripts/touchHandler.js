class touchHandler {
    constructor(element, callback) {
        this.callback = callback;

        this.startPos = null;
        this.startTime = null;
        this.endPos = null;

        this.minLength = 100; // pixels
        this.minSpeed = 400; // pixels per second
        this.ratioNeeded = 1.2; // Diagonal swipes are ambiguous! Ratio needed for clarity

        element.addEventListener("touchstart", (event) => this.handleStart(event),true);
        element.addEventListener("touchmove", (event) => this.handleMove(event), true);
        element.addEventListener("touchend", (event) => this.handleEnd(event), true);
    }

    handleStart(event) {
        event.preventDefault();

        this.reset();

        const touch = event.changedTouches[0];
        this.startPos = [touch.pageX, touch.pageY]; // store where the swipe started
        this.startTime = (new Date()).getTime();
    }

    handleMove(event) {
        event.preventDefault();
        const touch = event.changedTouches[0];
        this.endPos = [touch.pageX, touch.pageY]; // store where the swipe is
    }

    handleEnd(event) {
        event.preventDefault();
        // Only do if we have a start point to reference
        if (this.startPos && this.startTime && this.endPos) {
            const startPos = this.startPos;
            const endPos = this.endPos; // store where the swipe started
            const swipeVector = [endPos[0] - startPos[0], endPos[1] - startPos[1]];
            const length = Math.sqrt( (swipeVector[0])**2 + (swipeVector[1])**2 );
            const duration = (new Date()).getTime() - this.startTime;

            const speed = 1000 * length / duration;

            // Check if the swipe was long enough and fast enough
            if (length > this.minLength && speed > this.minSpeed) {
                // Horizontal swipe
                if (Math.abs(swipeVector[0] / swipeVector[1]) > this.ratioNeeded) {
                    if (swipeVector[0] > 0) {
                        this.sendSwipe('SwipeRight');
                    }
                    else {
                        this.sendSwipe('SwipeLeft');
                    }
                }
                // Vertical swipe
                else if (Math.abs(swipeVector[1] / swipeVector[0]) > this.ratioNeeded) {
                    if (swipeVector[1] > 0) {
                        this.sendSwipe('SwipeDown');
                    }
                    else {
                        this.sendSwipe('SwipeUp');
                    }
                }
            }
        }

        this.reset();
    }

    reset() {
        // Reset numbers
        this.startPos = null;
        this.startTime = null;
        this.endPos = null;
    }

    // Easiest way seems to me to just build a custom event object and send it the same place keys go (stored in callback)
    sendSwipe(swipeString) {
        const event = {
            preventDefault: () => null,
            key: swipeString
        }

        if (this.callback) {
            this.callback(event);
        }
    }
}

export default touchHandler;