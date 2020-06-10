"use strict";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const $performance = $("#performance");

const $cellSize = $("#cellSize");
const $maxColonies = $("#maxColonies");
const $colonySize = $("#colonySize");
const $framerate = $("#framerate");

let cellSize = $cellSize.val();
let maxColonySize = $colonySize.val();
let numOfColonies = $maxColonies.val();
let fps = $framerate.val();

let lastTime = 0;
let height = ctx.canvas.clientHeight / cellSize;
let width = ctx.canvas.clientWidth / cellSize;

const cells = [];

let drawTarget = new ImageData(width, height);
ctx.imageSmoothingEnabled = false;

function inBounds(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
}

function setCell(x, y, cell) {
    if (inBounds(x, y)) cells[y * width + x] = cell;
}

function getCell(x, y) {
    return inBounds(x, y) ? cells[y * width + x] : 0;
}

function spawnColonies() {
    for (let i = 0; i < width * height; i++) {
        cells[i] = 0;
    }

    for (let k = 0; k < numOfColonies; k++) {
        let locX = Math.random() * width;
        let locY = Math.random() * height;
        let size = Math.random() * maxColonySize + 1;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                if (Math.random() > 0.7) continue;
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

function generateUniverse() {
    width = ctx.canvas.clientWidth / cellSize;
    height = ctx.canvas.clientHeight / cellSize;
    drawTarget = new ImageData(width, height);

    cells.length = 0;
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
        getCell(x - 1, y - 1),
    ];
}

function getNeighborInfo(x, y, cell) {
    let totalAlive = 0;
    let totalEnemy = 0;

    let totalRed = 0;
    let totalBlue = 0;

    const neighbors = getNeighbors(x, y);
    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (neighbor !== 0) {
            totalAlive++;
            if (neighbor !== cell) totalEnemy++;
            if (neighbor === 1) totalBlue++;
            else totalRed++;
        }
    }

    return {
        totalAlive,
        dominantTeam: totalBlue > totalRed ? 1 : 2,
        totalEnemy,
    };
}

let inc = 0;
async function loop() {
    lastTime = performance.now();

    // Clear the Canvas
    for (let i = 0; i < width * height * 4; i += 4) {
        drawTarget.data[i] = 255;
        drawTarget.data[i + 1] = 255;
        drawTarget.data[i + 2] = 255;
        drawTarget.data[i + 3] = 10;
    }

    if (inc >= 360) inc = 0;
    let c = (Math.sin(inc * (Math.PI / 180.0)) + 1) * 0.5 * 255;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const cell = getCell(x, y);
            const { totalAlive, totalEnemy, dominantTeam } = getNeighborInfo(
                x,
                y,
                cell
            );
            const isAlive = cell !== 0;

            if (isAlive) {
                // Under population, Overpopulation, and Team Fighting
                if (totalAlive < 2 || totalAlive > 3 || totalEnemy >= 4) {
                    setCell(x, y, 0);
                }

                const d = (y * width + x) * 4;
                drawTarget.data[d] = cell === 2 ? c : 0;
                drawTarget.data[d + 1] = 0;
                drawTarget.data[d + 2] = cell === 1 ? c : 0;
                drawTarget.data[d + 3] = 255;
            } else if (totalAlive === 3) {
                setCell(x, y, dominantTeam);
            }
        }
    }

    const frame = await createImageBitmap(drawTarget);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    const delta = (performance.now() - lastTime) / 1000;
    lastTime = performance.now();

    $performance.html(`${(1 / delta).toFixed(0)} FPS`);
    setTimeout(loop, 1000 / fps);
}

// EVENTS
// ======================================================

$cellSize.change(() => {
    let value = $cellSize.val();
    $("label[for='cellSize']").html(`Cell Size: ${value}`);
    cellSize = value;
    generateUniverse();
    spawnColonies();
});

$colonySize.change(() => {
    let value = $colonySize.val();
    $("label[for='colonySize']").html(`Max Colony Size: ${value}`);
    maxColonySize = value;
    spawnColonies();
});

$maxColonies.change(() => {
    let value = $maxColonies.val();
    $("label[for='maxColonies']").html(`Max Colonies: ${value}`);
    numOfColonies = value;
    spawnColonies();
});

$framerate.change(() => {
    let value = $framerate.val();
    $("label[for='framerate']").html(`FPS: ${value}`);
    fps = value;
    spawnColonies();
});

$(async () => {
    generateUniverse();
    spawnColonies();
    requestAnimationFrame(loop);
});
