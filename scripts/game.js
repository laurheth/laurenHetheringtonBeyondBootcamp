// javascript will go here
const dimensions = [28, 36];
const totalTiles = dimensions[0] * dimensions[1];
const gameBoard = document.getElementById('game');

const tiles = [];

for (let i=0; i<totalTiles; i++) {
    const newTile = document.createElement('div');
    newTile.className = 'tile';
    tiles.push(newTile);
    gameBoard.appendChild(newTile);
}
