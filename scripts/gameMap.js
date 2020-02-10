// Everything to do with the map, where walls are, where pellets are, etc
import mapData from './mapData.js';

class tile {
    constructor(element) {
        this.element = element;
        this.element.classList.add('tile');
        this.passable = true; // is this tile passable?
        this.junction = false; // is this a junction? Used for ghost AI
        this.noUpwardsGhosts = false; // some tiles ghosts cannot decide to go up
        this.food=false;
        this.powerUp=false;
        this.tunnel=false;
        this.horizontalGhostMovementOnly=false;
    }
    makeWall() {
        this.element.classList.add('wall');
        this.passable=false;
    }
    addFood() {
        this.element.classList.add('food');
        this.food=true;
    }
    removeFood() {
        this.element.classList.remove('food');
        this.food=false;
    }
    addPowerUp() {
        this.element.classList.add('power');
        this.powerUp=true;
    }
    removePowerUp() {
        this.element.classList.remove('power');
        this.powerUp=false;
    }
    isPassable() {
        return this.passable;
    }
    takeContents() {
        if (this.food) {
            this.removeFood();
            return 'food';
        }
        else if (this.powerUp) {
            this.removePowerUp();
            return 'powerUp';
        }
        else {
            return '';
        }
    }
}

const gameMap = {
    // columns, rows => x,y
    dimensions: [28, 31],
    totalTiles: 0,
    foodEaten: 0,
    gameBoard: null,
    playerRef: null,
    ghostRefs: [null,null,null,null],
    foodTotal: 0,

    tiles: [],

    init() {
        // get the gameBoard element
        this.gameBoard = document.getElementById('game');
        // calculate total tiles
        this.totalTiles = this.dimensions[0] * this.dimensions[1];

        // allocate tiles for the game map
        for (let i=0; i<this.totalTiles; i++) {
            // element for the tile
            const newTileElement = document.createElement('div');
            this.gameBoard.appendChild(newTileElement);

            // object for game logic
            const newTile = new tile(newTileElement);
            this.tiles.push(newTile);
        }
        this.loadMap();
    },

    loadMap() {
        this.foodTotal=0;
        // Draw the map
        for (let i=0; i<mapData.length; i++) {
            let mapRow = mapData[i].split('');
            for (let j=0; j<mapRow.length; j++) {
                const thisTile = this.tiles[i * this.dimensions[0] + j];
                if (mapRow[j] === '#' ) {
                    thisTile.makeWall();
                }
                else if (mapRow[j] === '_' || mapRow[j] === 'H') {
                    thisTile.passable=false;
                }
                else if (mapRow[j] === '.' || mapRow[j] === 'V') {
                    this.foodTotal++;
                    thisTile.addFood();
                }
                else if (mapRow[j] === '+') {
                    thisTile.addPowerUp();
                }
                else if (mapRow[j] === '-') {
                    thisTile.tunnel=true;
                }

                if (mapRow[j] === 'v' || mapRow[j] === 'V') {
                    thisTile.horizontalGhostMovementOnly = true;
                }
            }
        }
    },

    // Take a position and force it to be within the map
    keepOnMap(position) {
        const correctPosition = position.map((coordinate,index) => {
            // the size of the map along the current axis being worried about
            const axisSize = this.dimensions[index];
            // Weird modulo shenanigans to ensure positive results.
            // JavaScript modulo gives negative values for negative numbers, which, I have opinions about.
            return (coordinate % axisSize + axisSize) % axisSize;
        });
        return correctPosition;
    },

    tileIndex(column,row) {
        // Force to be within the map, and integers
        [column, row] = this.keepOnMap([Math.round(column),Math.round(row)]);
        return row * this.dimensions[0] + column;
    },

    // Check if a tile on the map is passable
    checkCollision(column,row) {
        const index = this.tileIndex(column, row);
        return  this.tiles[index].isPassable();
    },

    // Check if tunnel
    checkTunnel(column, row) {
        const index = this.tileIndex(column, row);
        return  this.tiles[index].tunnel;
    },

    // Check if vertical movement is allowed
    checkVerticalMovementAllowed(column, row) {
        const index = this.tileIndex(column, row);
        return !this.tiles[index].horizontalGhostMovementOnly;
    },

    // Take contents
    takeContents(column,row) {
        const index = this.tileIndex(column, row);
        if (index >= 0 && index < this.tiles.length) {
            if (this.tiles[index].food) {
                this.foodEaten++;
            }
            return  this.tiles[index].takeContents();
        }
        else {
            return '';
        }
    },

    // Get element offsets
    // converts game-logic row and column into top & left percentages
    elementPosition(column, row) {
        return [100 * (column+0.5) / this.dimensions[0] , 100 * (row+0.5) / this.dimensions[1]];
    }
}

export default gameMap;