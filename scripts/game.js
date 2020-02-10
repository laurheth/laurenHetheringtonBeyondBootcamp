// javascript will go here
import gameMap from './gameMap.js';
import player from './player.js';
import ghost from './ghost.js';

// Initialize the game map
gameMap.init();

// set a time interval in seconds, might change later
const timeInterval = 1/30;
let timePassed=0;

// Game plan
const gamePlan = [
    ['scatter', 7],
    ['chase', 20],
    ['scatter', 7],
    ['chase', 20],
    ['scatter', 5],
    ['chase', 20],
    ['scatter', 5],
    ['chase', Infinity],
]

// Initialize the player
const pacLauren = new player(gameMap,13.5,17,timeInterval);

gameMap.playerRef = pacLauren;

// Initialize a ghost
const redGhost = new ghost(gameMap, 13.5,11, timeInterval,'red');
redGhost.danceMovesToGo = -1;

gameMap.ghostRefs[0] = redGhost;

const blueGhost = new ghost(gameMap, 11.5,14, timeInterval,'blue');
blueGhost.freeFromHouseThreshold=30;
const orangeGhost = new ghost(gameMap, 15.5,14, timeInterval,'orange');
orangeGhost.freeFromHouseThreshold=gameMap.foodLeft / 3;
const pinkGhost = new ghost(gameMap, 13.5,14, timeInterval,'pink');

gameMap.ghostRefs[1]=blueGhost;
gameMap.ghostRefs[2]=pinkGhost;
gameMap.ghostRefs[3]=orangeGhost;

// Setup the event listener
document.onkeydown = (event) => pacLauren.getEvent(event);

// Setup the main game loop
const gameLoop = setInterval(() => {
    pacLauren.doUpdate();
    gameMap.ghostRefs.forEach((ghost)=>ghost.doUpdate());
    timePassed+=timeInterval;
    if (timePassed > gamePlan[0][1]) {
        timePassed=0;
        gamePlan.shift();
        if (gamePlan[0][0] === 'scatter') {
            gameMap.ghostRefs.forEach((ghost)=>{
                ghost.reverseDirection();
                ghost.scatterMode=true;
            });
        }
        else {
            gameMap.ghostRefs.forEach(ghost=>ghost.scatterMode=false);
        }
    }
}, 1000 * timeInterval);