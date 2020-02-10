// javascript will go here
import gameMap from './gameMap.js';
import player from './player.js';
import ghost from './ghost.js';

// Initialize the game map
gameMap.init();

// set a time interval in seconds, might change later
const timeInterval = 1/30;

// Initialize the player
const pacLauren = new player(gameMap,13.5,17,timeInterval);

gameMap.playerRef = pacLauren;

// Initialize a ghost
const redGhost = new ghost(gameMap, 13.5,17, timeInterval,'red');

gameMap.ghostRefs[0] = redGhost;

const blueGhost = new ghost(gameMap, 13.5,17, timeInterval,'blue');
const orangeGhost = new ghost(gameMap, 13.5,17, timeInterval,'orange');
const pinkGhost = new ghost(gameMap, 13.5,17, timeInterval,'pink');

gameMap.ghostRefs[1]=blueGhost;
gameMap.ghostRefs[2]=pinkGhost;
gameMap.ghostRefs[3]=orangeGhost;

// Setup the event listener
document.onkeydown = (event) => pacLauren.getEvent(event);

// Setup the main game loop
const gameLoop = setInterval(() => {
    // console.log(pacLauren);
    pacLauren.doUpdate();
    gameMap.ghostRefs.forEach((ghost)=>ghost.doUpdate());
}, 1000 * timeInterval);