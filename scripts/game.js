// javascript will go here
import gameMap from './gameMap.js';
import player from './player.js';
import ghost from './ghost.js';
import fruit from './fruit.js';
import touchHandler from './touchHandler.js';

const game = {
    targetTimeInterval: 1/60, // Target time interval, but in practice, is not to level of precision we need.
    timePassed: 0,
    currentTime: 0,
    gamePlan: ['chase', Infinity],
    gameLoop: null,
    level: 1,
    pacLauren: null,
    paused: false,
    score: 0,
    highScore: 0,
    scoreElement: null,
    highScoreElement: null,
    lives: 2,
    livesElement: null,
    fruitThresholds: [],
    fruitStats: ['🍒',100],
    fruit: null,
    fruitRecordElement: null,
    touchHandler: null,
    init() {
        // Initialize the game map
        gameMap.init();
        
        // Initialize the player
        this.pacLauren = new player(gameMap,13.5,23);
        
        // Store a reference for the player
        gameMap.playerRef = this.pacLauren;
        gameMap.playerRef.addToScore = (number, column, rows) => this.addToScore(number, column, rows);
        gameMap.playerRef.dieFunction = () => this.playerCaptured();

        
        // Initialize ghosts
        const redGhost = new ghost(gameMap, 13.5,11,'red');
        redGhost.danceMovesToGo = -1;
        
        gameMap.ghostRefs[0] = redGhost;
        
        const blueGhost = new ghost(gameMap, 11.5,14,'blue');
        blueGhost.freeFromHouseThreshold=30;
        const orangeGhost = new ghost(gameMap, 15.5,14,'orange');
        orangeGhost.freeFromHouseThreshold=gameMap.foodTotal / 3;
        const pinkGhost = new ghost(gameMap, 13.5,14,'pink');
        
        gameMap.ghostRefs[1]=pinkGhost;
        gameMap.ghostRefs[2]=blueGhost;
        gameMap.ghostRefs[3]=orangeGhost;
        
        // Setup level properties
        this.setLevelProperties();
        this.resetFruitThreshold();

        // Setup the event listener for keyboard
        document.onkeydown = (event) => gameMap.playerRef.getEvent(event);

        // Event listeners for touches
        this.touchHandler = new touchHandler(gameMap.gameBoard, gameMap.playerRef);

        
        // Get the elements for keeping track of score and lives
        this.livesElement = document.getElementById('lives');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.fruitRecordElement = document.getElementById('fruit');

        // Initialize score and get the previous high score if it exists
        this.highScore = this.getHighScore();
        this.displayHighScore();
        
        // Initialize the current time
        this.currentTime = this.getSeconds();

        // Update lives list
        this.updateLives();
        
        // Start getting ready...
        this.getReady();

        // Setup the main game loop
        // This loop needs a hight frequency in order to avoid walking through walls, etc.
        this.gameLoop = setInterval(() => this.mainGameLoop(), 1000 * this.targetTimeInterval);

        // This loop can have a lower frequency. It's appearance, which matters, but it is also more expensive than any of the game logic. Lower frequency to make life better on mobile devices.
        setInterval(()=>this.graphicsLoop(),2000 * this.targetTimeInterval);
    },

    // Graphics loop, can be a bit slower than main game loop
    graphicsLoop() {
        this.pacLauren.updateElement();
        gameMap.ghostRefs.forEach((ghost)=>ghost.updateElement());
    },

    // Function that runs every frame of the game
    mainGameLoop() {

        // Update the current time, and store the time interval since the last frame.
        const updatedTime = this.getSeconds();
        // Record time interval, but make sure it has an upper limit to prevent wonky behavior like walking through walls
        const timeInterval = Math.min(updatedTime - this.currentTime, 3*this.targetTimeInterval);
        this.currentTime = updatedTime;



        if (this.paused) {
            return;
        }
        // advance the clock
        this.timePassed+=timeInterval;

    
        // Run update method for player, and all ghosts
        this.pacLauren.doUpdate(timeInterval);
        gameMap.ghostRefs.forEach((ghost)=>ghost.doUpdate(timeInterval));

        // If enough time has gone by, set the next game mode on the agenda
        if (this.timePassed > this.gamePlan[0][1]) {
            this.timePassed=0;
            this.gamePlan.shift();
            // Scatter mode
            if (this.gamePlan[0][0] === 'scatter') {
                gameMap.ghostRefs.forEach(ghost=>ghost.scatterMode=true);
            }
            // Chase mode
            else {
                gameMap.ghostRefs.forEach(ghost=>ghost.scatterMode=false);
            }
            gameMap.ghostRefs.forEach(ghost=>ghost.reverseDirection());
        }

        // Handle the fruit logic!
        if (this.fruitThresholds.length>0 && gameMap.foodEaten > this.fruitThresholds[0]) {
            this.addFruit();
        }

        if (this.fruit) {
            // returns true if the fruit hasn't timed out, false otherwise
            if (this.fruit.incrementTime(timeInterval)) {
                if (this.fruit.checkFruitCollision([gameMap.playerRef.column, gameMap.playerRef.row])) {
                    this.addToScore(this.fruit.getFruit(), this.fruit.column, this.fruit.row);

                    if (!this.fruitRecordElement.textContent.includes(this.fruit.symbol)) {
                        this.fruitRecordElement.textContent = `${this.fruit.symbol}${this.fruitRecordElement.textContent}`;
                    }

                    this.fruit = null;
                }
            }
            else {
                this.fruit = null;
            }
        }

        // Check if every food has been eaten. If it has, go to the next level!
        if (gameMap.foodEaten >= gameMap.foodTotal) {
            this.victory();
        }

        if (this.paused) {
            this.runAnimations(false);
        }
    },

    // Code to run to prepare the next level
    nextLevel() {
        gameMap.foodEaten=0;
        this.level++;
        // this.setLevelProperties();
        // gameMap.playerRef.reset();
        // this.timePassed=0;
        this.resetFruitThreshold();
        gameMap.loadMap();
        // this.getReady();
        this.newLife();
    },

    // Restart the game to level 1
    // "Clever approach", reset score and lives, then set level to 0, then just use this.nextLevel() to get to level 1
    restart() {
        this.level = 0;
        this.score=0;
        this.lives = 2;
        this.nextLevel();
    },

    // Food-eaten thresholds for fruit to appear
    resetFruitThreshold() {
        this.fruitThresholds = [70, 170];
    },

    // Add fruit!
    addFruit() {
        // Remove the most recent fruit threshold
        this.fruitThresholds.shift();
        // Add the fruit
        this.fruit = new fruit(this.fruitStats[0], this.fruitStats[1], gameMap);
    },

    newLife() {
        this.setLevelProperties();
        gameMap.playerRef.reset();
        this.timePassed=0;
        this.getReady();
    },

    playerCaptured() {
        // Only do this if the game isn't currently paused, to avoid losing multiple lives at the same time
        if (!this.paused) {
            this.pauseGame();
            this.addToLives(-1);
            if (this.lives >= 0) {
                setTimeout(()=>this.newLife(),2000);
            }
            else {
                this.gameOver();
            }
        }
    },

    addToLives(number) {
        this.lives+=number;
        this.updateLives();
    },

    updateLives() {
        const toDisplay = Math.floor(Math.max(this.lives,0));
        // clear child nodes
        while (this.livesElement.firstChild) {
            this.livesElement.removeChild(this.livesElement.firstChild);
        }
        // Add lives
        for (let i=0;i<toDisplay;i++) {
            const lifeSymbol = document.createElement('div');
            lifeSymbol.classList.add('character','player');
            this.livesElement.appendChild(lifeSymbol);
        }
    },

    addToScore(number, column=null, row=null) {
        const newScore = this.score + number;
        if ((this.score % 10000) > (newScore % 10000) ) {
            // extra life!
            this.addToLives(1);
        }
        this.score += number;
        this.updateScore();
        // If a position is given, display the point value gained at that location
        if (column && row) {
            gameMap.displayPoints(column, row, number);
        }
        if (this.score > this.highScore) {
            this.displayHighScore();
        }
    },

    updateScore() {
        this.scoreElement.textContent = Math.floor(Math.max(this.score,0));
    },

    displayHighScore() {
        this.highScoreElement.textContent = Math.floor(Math.max(this.score, this.highScore));
    },

    setHighScore(newHighScore) {
        window.localStorage.setItem('highScore',newHighScore.toString());
        this.highScore = newHighScore;
    },

    getHighScore() {
        const highScore = parseInt(window.localStorage.getItem('highScore'));
        if (highScore) {
            return highScore;
        }
        else {
            return 0;
        }
    },
    
    getReady() {
        this.pauseGame();
        document.querySelector('#game .messages p').textContent = "Ready!";
        document.querySelector('#game .messages').classList.remove('hide');
        if (this.fruit) {
            this.fruit.removeFruit();
            this.fruit=null;
        }
        gameMap.clearPoints();
        setTimeout(()=>this.commencePlay(),5000);
    },

    gameOver() {
        document.querySelector('#game .messages p').textContent = "Game over!";
        document.querySelector('#game .messages').classList.remove('hide');
        if (this.score > this.highScore) {
            this.setHighScore(this.score);
        }
    },

    commencePlay() {
        this.pauseGame(false);
        document.querySelector('#game .messages').classList.add('hide');
    },

    victory() {
        this.pauseGame();
        setTimeout(()=>this.nextLevel(),2000);
    },

    pauseGame(pause=true) {
        this.paused = pause;
        this.runAnimations(!pause);
    },

    runAnimations(run) {
        gameMap.ghostRefs.forEach(ghost=>ghost.animateMovement(run));
        gameMap.playerRef.animateMovement(false);
    },

    // generate properties for the current level. This includes the game plan, ghost speed, player speed, etc. Everything that is level-specific
    setLevelProperties() {
        // First, the game plan
        this.gamePlan = [
            ['scatter', 7],
            ['chase', 20],
            ['scatter', 7],
            ['chase', 20],
            ['scatter', 5],
            ['chase', 20],
            ['scatter', 5],
            ['chase', Infinity],
        ];
        if (this.level>=2) {
            this.gamePlan[5][1] = 1033;
            this.gamePlan[6][1] = this.timeInterval;
        }
        if (this.level>=5) {
            this.gamePlan[0][1] = 5;
            this.gamePlan[2][1] = 5;
            this.gamePlan[5][1] += 4;
        }

        // Next, speeds

        let baseSpeed=0.8;
        let powerUpSpeed=0.9;

        let baseGhostSpeed = 0.75;
        let ghostTunnelSpeed = 0.4;
        let ghostScaredSpeed = 0.5;
        if (this.level >= 2) {
            baseSpeed = 0.9;
            powerUpSpeed = 0.95;

            baseGhostSpeed = 0.85;
            ghostTunnelSpeed = 0.45;
            ghostScaredSpeed = 0.55;
        }
        if (this.level >= 5) {
            baseSpeed = 1;
            powerUpSpeed = 1;

            baseGhostSpeed = 0.95;
            ghostTunnelSpeed = 0.50;
            ghostScaredSpeed = 0.6;
        }
        if (this.level >= 21) {
            baseSpeed = 0.9;
            powerUpSpeed = 0.95;
        }
        gameMap.playerRef.setSpeedFactors(baseSpeed, powerUpSpeed);
        gameMap.ghostRefs.forEach(ghost => {
            ghost.setSpeedFactors(baseGhostSpeed,ghostScaredSpeed,ghostTunnelSpeed)
            ghost.reset();
        });

        // Ghost time in the ghost house
        gameMap.ghostRefs[0].danceMovesToGo=-1;
        gameMap.ghostRefs[1].freeFromHouseThreshold=0;
        if (this.level >= 2) {
            gameMap.ghostRefs[2].danceMovesToGo=12;
            gameMap.ghostRefs[2].freeFromHouseThreshold=0;
            gameMap.ghostRefs[3].freeFromHouseThreshold=50;
        }
        if (this.level >= 3) {
            gameMap.ghostRefs[3].freeFromHouseThreshold=0;
            gameMap.ghostRefs[3].danceMovesToGo=18;
        }

        // Cruise elroy mode
        // Number of remaining foods at which the red ghost should go faster.
        let elroyNumber;
        if (this.level >= 19) {
            elroyNumber = 120;
        }
        else if (this.level >= 15) {
            elroyNumber = 100;
        }
        else if (this.level >= 12) {
            elroyNumber = 80;
        }
        else if (this.level >= 9) {
            elroyNumber = 60;
        }
        else if (this.level >= 6) {
            elroyNumber = 50;
        }
        else if (this.level >= 3) {
            elroyNumber = 40;
        }
        else if (this.level >= 2) {
            elroyNumber = 30;
        }
        else {
            elroyNumber = 20;
        }

        gameMap.ghostRefs[0].elroyMode = elroyNumber;

        // How long do power pellets last?
        switch(this.level) {
            case 1:
                gameMap.playerRef.setPowerUpTimes(6,2.5);
                break;
            case 2:
            case 6:
            case 10:
                gameMap.playerRef.setPowerUpTimes(5,2.5);
                break;
            case 3:
                gameMap.playerRef.setPowerUpTimes(4,2.5);
                break;
            case 4:
            case 14:
                gameMap.playerRef.setPowerUpTimes(3,2.5);
                break;
            case 5:
            case 7:
            case 8:
            case 11:
                gameMap.playerRef.setPowerUpTimes(2.5,2.5);
                break;
            case 9:
            case 12:
            case 13:
            case 15:
            case 16:
            case 18:
                gameMap.playerRef.setPowerUpTimes(1.5,1.5);
                break;
            default:
                gameMap.playerRef.setPowerUpTimes(0,0);
                break;
        }
        // Fruits
        if (this.level > 12) {
            this.fruitStats = ['🔑',5000];
        }
        else if (this.level > 10) {
            this.fruitStats = ['🛎',3000];
        }
        else if (this.level > 8) {
            this.fruitStats = ['🚀',2000];
        }
        else if (this.level > 6) {
            this.fruitStats = ['🍇',1000];
        }
        else if (this.level > 4) {
            this.fruitStats = ['🍎',700];
        }
        else if (this.level > 2) {
            this.fruitStats = ['🍑',500];
        }
        else if (this.level === 2) {
            this.fruitStats = ['🍓',300];
        }
        else {
            this.fruitStats = ['🍒',100];
        }
    },

    // Returns the current time in seconds, with some decimal spaces.
    getSeconds() {
        return ((new Date).getTime())/1000;
    }
}

game.init();