const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 8;
const maxColonySize = 12;
let numOfColonies = $("#maxColonies").val();
let fps = $("#framerate").val();

const deadColor = "rgb(155, 255, 155)";
const blueColor = "blue";
const redColor = "red";

const width = ctx.canvas.clientWidth / cellSize;
const height = ctx.canvas.clientHeight / cellSize;

const cells = [];

$("#maxColonies").on('change', () => {
    let value = $('#maxColonies').val();
    $("label[for='maxColonies']").html(`Max Colonies: ${value}`);
    numOfColonies = value;
});

$("#framerate").on('change', () => {
    let value = $('#framerate').val();
    $("label[for='framerate']").html(`FPS: ${value}`);
    fps = value;
});

class Cell {
    constructor(isAlive, color) {
        this.isAlive = isAlive;
        this.color = color;
    }

    render(x, y) {
        ctx.fillStyle = this.color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }

    kill() {
        this.isAlive = false;
        this.color = deadColor;
    }

    birth(color) {
        this.isAlive = true;
        this.color = color;
    }
}

function setCell(x, y, cell) { cells[y * width + x] = cell; }
function getCell(x, y) { return cells[y * width + x]; }

function refreshWorld() {
    for (let i = 0; i < width * height; i++) {
        cells[i].kill();
    }

    for (let k = 0; k < numOfColonies; k++) {

        let locX = Math.random() * width;
        let locY = Math.random() * height;
        let size = Math.random() * maxColonySize + 1;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let dy = j - locY;
                let dx = i - locX;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < size) {
                    getCell(i, j).birth(k % 2 == 0 ? blueColor : redColor);
                }
            }
        }
    }
}

function generateWorld() {
    for (let i = 0; i < width * height; i++) {
        cells.push(new Cell(false, deadColor));
    }
}

const Direction = {
    RIGHT: 0,
    LEFT: 1,
    UP: 2,
    DOWN: 3,
    TOP_RIGHT: 4,
    BOTTOM_RIGHT: 5,
    TOP_LEFT: 6,
    BOTTOM_LEFT: 7
};

function getNeighbors(x, y) {
    let neighbors = [];

    neighbors.push(getCell(x + 1, y)); //right
    neighbors.push(getCell(x - 1, y)); //left

    neighbors.push(getCell(x, y + 1)); // up
    neighbors.push(getCell(x, y - 1)); // down

    neighbors.push(getCell(x + 1, y + 1)) // top right
    neighbors.push(getCell(x + 1, y - 1)) // bottom right

    neighbors.push(getCell(x - 1, y + 1)) // top left
    neighbors.push(getCell(x - 1, y - 1)) // bottom left

    return neighbors;
}

function countNeighbors(neighbors) {
    let count = 0;
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i] !== undefined && neighbors[i].isAlive) { count++; }
    }
    return count;
}

function enemyKillChance(neighbors, cell) {
    let count = 0;
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i] !== undefined && neighbors[i].color != cell.color && neighbors[i].isAlive) { count++; }
    }
    return count;
}

function getNeighborColor(neighbors) {
    let redCount = 0;
    let blueCount = 0;
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i] !== undefined) {
            if (neighbors[i].color == blueColor) blueCount += 1;
            if (neighbors[i].color == redColor) redCount += 1;
        }
    }

    return redCount > blueCount ? redColor : blueColor;
}

function loop() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let cell = getCell(x, y);
            let neighbors = getNeighbors(x, y);
            let count = countNeighbors(neighbors);

            if (!(cell.isAlive && (count === 3 || count === 2))) {
                cell.kill();
            }

            if (!cell.isAlive && count === 3) {
                cell.birth(getNeighborColor(neighbors));
            }

            if (Math.random() * 3 < enemyKillChance(neighbors, cell)) {
                cell.kill();
            }

            if (Math.random() > .99) {
                cell.kill();
            }

            cell.render(x, y);
        }

    }

    setTimeout(loop, 1000 / fps);
}

generateWorld();
requestAnimationFrame(loop);