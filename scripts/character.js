// code generic to characters
class character {
    constructor(mapReference, startColumn, startRow) {
        this.mapReference = mapReference; // reference to the game map object; we will need to use it a lot

        // Create dom element for the character
        this.element = document.createElement('div');
        this.element.classList.add('character');

        // Attach to the game board
        this.mapReference.gameBoard.appendChild(this.element);

        // Move to start position
        this.moveTo(startColumn, startRow);
    }

    moveTo(column, row) {
        this.column = column;
        this.row = row;
        const position = this.mapReference.elementPosition(this.column, this.row);
        this.element.style.left = `${position[0]}%`;
        this.element.style.top = `${position[1]}%`;
    }
}

export default character;