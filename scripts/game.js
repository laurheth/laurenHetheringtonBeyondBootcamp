// javascript will go here
import gameMap from './gameMap.js';
import player from './player.js';
import ghost from './ghost.js';

const game = {
    timeInterval: 1/60,
    timePassed: 0,
    gamePlan: ['chase', Infinity],
    gameLoop: null,
    level: 1,
    pacLauren: null,
    paused: false,
    score: 0,
    scoreElement: null,
    lives: 2,
    livesElement: null,
    init() {
        // Initialize the game map
        gameMap.init();
        
        // Initialize the player
        this.pacLauren = new player(gameMap,13.5,23,this.timeInterval);
        
        // Store a reference for the player
        gameMap.playerRef = this.pacLauren;
        gameMap.playerRef.addToScore = (number) => this.addToScore(number);
        gameMap.playerRef.dieFunction = () => this.playerCaptured();

        
        // Initialize ghosts
        const redGhost = new ghost(gameMap, 13.5,11, this.timeInterval,'red');
        redGhost.danceMovesToGo = -1;
        
        gameMap.ghostRefs[0] = redGhost;
        
        const blueGhost = new ghost(gameMap, 11.5,14, this.timeInterval,'blue');
        blueGhost.freeFromHouseThreshold=30;
        const orangeGhost = new ghost(gameMap, 15.5,14, this.timeInterval,'orange');
        orangeGhost.freeFromHouseThreshold=gameMap.foodTotal / 3;
        const pinkGhost = new ghost(gameMap, 13.5,14, this.timeInterval,'pink');
        
        gameMap.ghostRefs[1]=pinkGhost;
        gameMap.ghostRefs[2]=blueGhost;
        gameMap.ghostRefs[3]=orangeGhost;
        
        // Setup level properties
        this.setLevelProperties();

        // Setup the event listener
        document.onkeydown = (event) => gameMap.playerRef.getEvent(event);
        this.getReady();

        // Get the elements for keeping track of score and lives
        this.livesElement = document.getElementById('lives');
        this.scoreElement = document.getElementById('score');

        
        // Setup the main game loop
        this.gameLoop = setInterval(() => this.mainGameLoop(), 1000 * this.timeInterval);
    },

    // Function that runs every frame of the game
    mainGameLoop() {
        if (this.paused) {
            return;
        }
        // advance the clock
        this.timePassed+=this.timeInterval;

    
        // Run update method for player, and all ghosts
        this.pacLauren.doUpdate();
        gameMap.ghostRefs.forEach((ghost)=>ghost.doUpdate());

        // If enough time has gone by, set the next game mode on the agenda
        if (this.timePassed > this.gamePlan[0][1]) {
            this.timePassed=0;
            this.gamePlan.shift();
            // Scatter mode
            if (this.gamePlan[0][0] === 'scatter') {
                gameMap.ghostRefs.forEach((ghost)=>{
                    ghost.reverseDirection();
                    ghost.scatterMode=true;
                });
            }
            // Chase mode
            else {
                gameMap.ghostRefs.forEach(ghost=>ghost.scatterMode=false);
            }
        }

        // Check if every food has been eaten. If it has, go to the next level!
        if (gameMap.foodEaten >= gameMap.foodTotal) {
            this.victory();
        }
    },

    nextLevel() {
        gameMap.foodEaten=0;
        this.level++;
        this.setLevelProperties();
        gameMap.playerRef.reset();
        this.timePassed=0;
        gameMap.loadMap();
        this.getReady();
    },

    newLife() {
        this.setLevelProperties();
        gameMap.playerRef.reset();
        this.timePassed=0;
        this.getReady();
    },

    playerCaptured() {
        this.paused = true;
        this.addToLives(-1);
        if (this.lives >= 0) {
            setTimeout(()=>this.newLife(),2000);
        }
        else {
            this.gameOver();
        }
    },

    addToLives(number) {
        this.lives+=number;
        this.updateLives();
    },

    updateLives() {
        this.livesElement.textContent = Math.floor(Math.max(this.lives,0));
    },

    addToScore(number) {
        const newScore = this.score + number;
        if ((this.score % 10000) > (newScore % 10000) ) {
            // extra life!
            this.addToLives(1);
        }
        this.score += number;
        this.updateScore();
    },

    updateScore() {
        this.scoreElement.textContent = Math.floor(Math.max(this.score,0));
    },
    
    getReady() {
        this.paused=true;
        document.querySelector('#game .messages p').textContent = "Ready!";
        document.querySelector('#game .messages').classList.remove('hide');
        setTimeout(()=>this.commencePlay(),5000);
    },

    gameOver() {
        document.querySelector('#game .messages p').textContent = "Game over!";
        document.querySelector('#game .messages').classList.remove('hide');
    },

    commencePlay() {
        this.paused = false;
        document.querySelector('#game .messages').classList.add('hide');
    },

    victory() {
        this.paused = true;
        setTimeout(()=>this.nextLevel(),2000);
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
            elroyMumber = 60;
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
    }
}

game.init();