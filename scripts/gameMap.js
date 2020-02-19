// Everything to do with the map, where walls are, where pellets are, etc
import mapData from './mapData.js';

class tile {
    constructor(element) {
        this.element = element;
        this.element.classList.add('tile');
        this.passable = true; // is this tile passable?
        this.wall = false;
        this.noUpwardsGhosts = false; // some tiles ghosts cannot decide to go up
        this.food=false;
        this.powerUp=false;
        this.tunnel=false;
        this.horizontalGhostMovementOnly=false;
    }
    makeWall(symbol) {
        this.element.classList.add('wall');
        this.passable=false;
        this.wall=true;
        switch(symbol) {
            default:
                break;
            case '╔':
                this.element.classList.add('topLeftCorner');
                break;
            case '╗':
                this.element.classList.add('topRightCorner');
                break;
            case '╚':
                this.element.classList.add('bottomLeftCorner');
                break;
            case '╝':
                this.element.classList.add('bottomRightCorner');
                break;
            case '║':
                this.element.classList.add('vertical');
                break;
            case '═':
                this.element.classList.add('horizontal');
                break;
        }
    }
    makeDoor() {
        this.element.classList.add('door');
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
        mapData.forEach((mapRow,i) => {
            mapRow.split('').forEach((mapTile,j) => {
                const thisTile = this.tiles[i * this.dimensions[0] + j];
                if ('╔╗╚╝║═'.includes(mapTile)) {
                    thisTile.makeWall(mapTile);
                }
                else if (mapTile === '_' || mapTile === 'H') {
                    thisTile.passable=false;
                    if (mapTile === '_') {
                        thisTile.makeDoor();
                    }
                }
                else if (mapTile === '.' || mapTile === 'V') {
                    this.foodTotal++;
                    thisTile.addFood();
                }
                else if (mapTile === '+') {
                    thisTile.addPowerUp();
                }
                else if (mapTile === '-') {
                    thisTile.tunnel=true;
                }

                if (mapTile === 'v' || mapTile === 'V') {
                    thisTile.horizontalGhostMovementOnly = true;
                }
            })
        });
    },

    // Take a position and force it to be within the map
    keepOnMap(position) {
        const correctPosition = position.map((coordinate,index) => {
            // the size of the map along the current axis being worried about
            const axisSize = this.dimensions[index];
            if (coordinate >= axisSize) {
                return coordinate - axisSize;
            }
            else if (coordinate < 0) {
                return coordinate + axisSize;
            }
            else {
                return coordinate;
            }
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
    },

    // Returns the width of a single grid tile relative to the entire board
    elementWidth() {
        return 100 / this.dimensions[0];
    },

    elementHeight() {
        return 100 / this.dimensions[1];
    },

    // Draws a point value on the board for when you collect a fruit, or eat a ghost
    displayPoints(column, row, message) {
        const [left, top] = this.elementPosition(column,row);
        const newElement = document.createElement('div');
        newElement.classList.add('pointGain');
        newElement.textContent = message;
        newElement.style.left = `${left}%`;
        newElement.style.top = `${top}%`;
        this.gameBoard.appendChild(newElement);
    },

    clearPoints() {
        const pointDisplays = document.querySelectorAll('.pointGain');
        pointDisplays.forEach(element => {
            element.remove();
        })
    }
}

export default gameMap;