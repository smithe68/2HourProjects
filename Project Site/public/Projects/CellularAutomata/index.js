const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const $maxColonies = $('#maxColonies');
const $colonySize = $('#colonySize');
const $framerate = $("#framerate");
const $cellSize = $("#cellSize");
const $performance = $('#performance');

let cellSize = $cellSize.val();
let maxColonySize = $colonySize.val();
let numOfColonies = $maxColonies.val();
let fps = $framerate.val();

let lastTime = 0;

const bgColor = "rgb(155, 255, 155)";
const blueColor = "blue";
const redColor = "red";

let width = ctx.canvas.clientWidth / cellSize;
let height = ctx.canvas.clientHeight / cellSize;

const cells = [];
const cellNeighbors = [];

let drawTarget = new ImageData(width, height);
ctx.imageSmoothingEnabled = false;

$cellSize.change(() => {
    let value = $cellSize.val();
    $("label[for='cellSize']").html(`Cell Size: ${value}`);
    cellSize = value;
    width = ctx.canvas.clientWidth / cellSize;
    height = ctx.canvas.clientHeight / cellSize;
    drawTarget = new ImageData(width, height);
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

function inBounds(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
}

function setCell(x, y, cell) {
    if (inBounds(x, y)) {
        cells[y * width + x] = cell;
    }
}

function getCell(x, y) {
    if (inBounds(x, y)) {
        return cells[y * width + x];
    } else {
        return 0;
    }
}

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
        if (neighbor !== 0) {
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

async function loop() {
    lastTime = performance.now();

    // Clear the Canvas
    for (let i = 0; i < width * height * 4; i += 4) {
        drawTarget.data[i] = 155;
        drawTarget.data[i + 1] = 255;
        drawTarget.data[i + 2] = 155;
        drawTarget.data[i + 3] = 255;
    }

    const fillRect = (x, y, color) => {
        let d = (y * width + x) * 4;
        drawTarget.data[d] = color.r;
        drawTarget.data[d + 1] = color.g;
        drawTarget.data[d + 2] = color.b;
        drawTarget.data[d + 3] = color.a;
    };

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let cell = getCell(x, y);
            let isAlive = cell !== 0;

            let { totalAlive, totalEnemy, dominantTeam } = getNeighborInfo(x, y);

            if (isAlive) {
                // Under population, Overpopulation, and Team Fighting
                if (totalAlive < 2 || totalAlive > 3 ||
                    totalEnemy > Math.random() * 4) {
                    setCell(x, y, 0);
                }

                let color = {
                    r: cell === 2 ? 255 : 0,
                    g: 0,
                    b: cell === 1 ? 255 : 0,
                    a: 255
                };

                fillRect(x, y, color);
            }
            else {
                // Birth
                if (totalAlive === 3) setCell(x, y, dominantTeam);
            }
        }
    }

    let frame = await createImageBitmap(drawTarget);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    let delta = (performance.now() - lastTime) / 1000;
    lastTime = performance.now();

    $performance.html(`${(1 / delta).toFixed(0)} FPS`);
    setTimeout(loop, 1000 / fps);
}

generateWorld();
refreshWorld();
requestAnimationFrame(loop);
