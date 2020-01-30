// javascript will go here
const dimensions = [28, 31];
const totalTiles = dimensions[0] * dimensions[1];
const gameBoard = document.getElementById('game');

const tiles = [];

const mapData = [
    `############################`,
    `#............##............#`,
    `#.####.#####.##.#####.####.#`,
    `#+#  #.#   #.##.#   #.#  #+#`,
    `#.####.#####.##.#####.####.#`,
    `#..........................#`,
    `#.####.##.########.##.####.#`,
    `#.####.##.########.##.####.#`,
    `#......##....##....##......#`,
    `######.##### ## #####.######`,
    `     #.##### ## #####.#     `,
    `     #.##          ##.#     `,
    `     #.## ###  ### ##.#     `,
    `######.## #      # ##.######`,
    `      .   #      #   .      `,
    `######.## #      # ##.######`,
    `     #.## ######## ##.#     `,
    `     #.##          ##.#     `,
    `     #.## ######## ##.#     `,
    `######.## ######## ##.######`,
    `#............##............#`,
    `#.####.#####.##.#####.####.#`,
    `#.####.#####.##.#####.####.#`,
    `#+..##................##..+#`,
    `###.##.##.########.##.##.###`,
    `###.##.##.########.##.##.###`,
    `#......##....##....##......#`,
    `#.##########.##.##########.#`,
    `#.##########.##.##########.#`,
    `#..........................#`,
    `############################`
];

// draw gameboard
for (let i=0; i<totalTiles; i++) {
    const newTile = document.createElement('div');
    newTile.className = 'tile';
    tiles.push(newTile);
    gameBoard.appendChild(newTile);
}

// Draw the map
for (let i=0; i<mapData.length; i++) {
    let mapRow = mapData[i].split('');
    // console.log(mapRow);
    for (let j=0; j<mapRow.length; j++) {
        const thisTile = tiles[i * dimensions[0] + j];
        if (mapRow[j] === '#') {
            thisTile.classList.add('wall');
        }
        else if (mapRow[j] === '.') {
            thisTile.classList.add('food');
        }
        else if (mapRow[j] === '+') {
            thisTile.classList.add('power');
        }
    }
}