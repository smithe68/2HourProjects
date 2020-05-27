const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const $maxColonies = $('#maxColonies');
const $colonySize = $('#colonySize');
const $framerate = $("#framerate");
const $cellSize = $("#cellSize");

let cellSize = $cellSize.val();
let maxColonySize = $colonySize.val();
let numOfColonies = $maxColonies.val();
let fps = $framerate.val();

const bgColor = "rgb(155, 255, 155)";
const blueColor = "blue";
const redColor = "red";

let width = ctx.canvas.clientWidth / cellSize;
let height = ctx.canvas.clientHeight / cellSize;

const cells = [];
const cellNeighbors = [];

$cellSize.change(() => {
    let value = $cellSize.val();
    $("label[for='cellSize']").html(`Cell Size: ${value}`);
    cellSize = value;
    width = ctx.canvas.clientWidth / cellSize;
    height = ctx.canvas.clientHeight / cellSize;
    generateWorld();
    refreshWorld();
});


$colonySize.change(() => {
    let value = $colonySize.val();
    $("label[for='colonySize']").html(`Max Colony Size: ${value}`);
    maxColonySize = value;
    refreshWorld();
});

$maxColonies.change(() => {
    let value = $maxColonies.val();
    $("label[for='maxColonies']").html(`Max Colonies: ${value}`);
    numOfColonies = value;
    refreshWorld();
});

$framerate.change(() => {
    let value = $framerate.val();
    $("label[for='framerate']").html(`FPS: ${value}`);
    fps = value;
    refreshWorld();
});

function setCell(x, y, cell) { cells[y * width + x] = cell; }
function getCell(x, y) { return cells[y * width + x]; }

function refreshWorld() {
    for (let i = 0; i < width * height; i++) { cells[i] = 0; }

    for (let k = 0; k < numOfColonies; k++) {

        let locX = Math.random() * width;
        let locY = Math.random() * height;
        let size = Math.random() * maxColonySize + 1;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let dy = j - locY;
                let dx = i - locX;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= size) {
                    setCell(i, j, k % 2 == 0 ? 1 : 2);
                }
            }
        }
    }
}

function generateWorld() {
    for (let i = 0; i < width * height; i++) {
        cells.push(0);
    }
}

function getNeighbors(x, y) {
    return [
        getCell(x + 1, y),
        getCell(x - 1, y),
        getCell(x, y + 1),
        getCell(x, y - 1),
        getCell(x + 1, y + 1),
        getCell(x + 1, y - 1),
        getCell(x - 1, y + 1),
        getCell(x - 1, y - 1)
    ];
}

function getNeighborInfo(x, y) {
    let totalAlive = 0;
    let totalEnemy = 0;

    let totalRed = 0;
    let totalBlue = 0;

    let cell = getCell(x, y);
    getNeighbors(x, y).forEach(neighbor => {
        if (neighbor !== undefined && neighbor !== 0) {
            totalAlive++;
            if (neighbor !== cell) totalEnemy++;
            if (neighbor === 1) totalBlue++;
            else totalRed++;
        }
    });

    return {
        totalAlive,
        dominantTeam: totalBlue > totalRed ? 1 : 2,
        totalEnemy
    };
}

function loop() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let cell = getCell(x, y);
            let isAlive = cell !== 0;

            let { totalAlive, totalEnemy, dominantTeam } = getNeighborInfo(x, y);

            // If cell is dead I dont care
            if (totalAlive === 0) continue;

            // Underpopulation and Overpopulation
            if (isAlive && (totalAlive === 2 || totalAlive > 4)) { setCell(x, y, 0) }

            // Birth
            if (!isAlive && totalAlive === 3) { setCell(x, y, dominantTeam); }

            // Team Fighting
            if (isAlive && totalEnemy > Math.random() * 4) { setCell(x, y, 0); }

            // Rendering
            ctx.fillStyle = cell === 1 ? blueColor : redColor;
            if (cell !== 0) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
            }
        }
    }

    setTimeout(loop, 1000 / fps);
}

generateWorld();
refreshWorld();
requestAnimationFrame(loop);