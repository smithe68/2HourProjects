import $ from 'jquery';

/*
    Pre Programming Notes:
    =============================================

    Create cellular automata, that are full of a cell object depending on the object type
    different rules will be followed

    Things physics has that we want to represent: Gravity, Wind

    Steps going forward:
    =============================================

    1. Set up canvas and environment
    2. Set up rendering objects
    3. Create cell type classes e.g Water, Sand, Dirt, etc..
    4. Display cells
    5. Design base functions
    6. debug
    7. style
    8. additional features time permitting
*/

enum Material {
    Air,
    Dirt,
    Sand,
    Life,
    Water
}

// CONSTANTS
// ==============================

const CELL_SIZE: number = 8;
const TARGET_FPS: number = 60;

const canvas = document.querySelector('canvas');
const ctx = canvas?.getContext('2d');

const $fpsText = $('#fps');

let lastTime = 0;

let mousePos: MousePos = { x: 0, y: 0 };
let isDrawing: boolean = false;
let brush: Material = Material.Sand;

const colors: { [mat: number]: Color } = {
    1: { r: 100, g: 100, b: 100, a: 255 },
    2: { r: 120, g: 120, b: 0, a: 255 },
    3: { r: 10, g: 200, b: 30, a: 85 },
    4: { r: 0, g: 0, b: 255, a: 50 }
};

class Universe {

    static width: number;
    static height: number;

    static drawTarget: ImageData;
    static cells: number[];

    static init(width: number, height: number) {
        Universe.width = width;
        Universe.height = height;

        Universe.drawTarget = new ImageData(width, height);
        Universe.cells = [];

        if (ctx) {
            ctx.imageSmoothingEnabled = false;
        }

        Universe.populate();
    }

    static inBounds(x: number, y: number): boolean {
        return x >= 0 && x < Universe.width && y >= 0 && y < Universe.height;
    }

    static setCell(x: number, y: number, cell: number) {
        if (Universe.inBounds(x, y)) Universe.cells[y * Universe.width + x] = cell;
    }

    static getCell(x: number, y: number): number {
        return Universe.inBounds(x, y) ? Universe.cells[y * Universe.width + x] : 0;
    }

    static getNeighbors(x: number, y: number) {
        return [
            Universe.getCell(x + 1, y),
            Universe.getCell(x - 1, y),
            Universe.getCell(x, y + 1),
            Universe.getCell(x, y - 1),
            Universe.getCell(x + 1, y + 1),
            Universe.getCell(x + 1, y - 1),
            Universe.getCell(x - 1, y + 1),
            Universe.getCell(x - 1, y - 1)
        ];
    }

    static getNeighborInfo(x: number, y: number, cell: number) {
        let totalAlive = 8;
        const neighbors = Universe.getNeighbors(x, y);

        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            if (neighbor !== Material.Life) {
                totalAlive--;
            }
        }
        return totalAlive;
    }

    private static populate() {
        for (let i = 0; i < Universe.height * Universe.width; i++) {
            Universe.cells.push(Material.Air);
        }
    }

    private static draw(x: number, y: number, color: Color) {
        const d = (y * Universe.width + x) * 4;
        Universe.drawTarget.data[d] = color.r;
        Universe.drawTarget.data[d + 1] = color.g;
        Universe.drawTarget.data[d + 2] = color.b;
        Universe.drawTarget.data[d + 3] = color.a;
    }

    static drawDynamic(x: number, y: number, cell: number) {
        if (ctx) {
            let color = colors[cell];
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    static async tick() {
        if (canvas === null) { return; }
        lastTime = performance.now();

        const frame = await createImageBitmap(Universe.drawTarget);
        ctx?.drawImage(frame, 0, 0, canvas.width, canvas.height);

        for (let x = 0; x < Universe.width; x++) {
            for (let y = 0; y < Universe.height; y++) {
                Universe.draw(x, y, { r: 185, g: 174, b: 168, a: 255 });
            }
        }

        for (let x = 0; x < Universe.width; x++) {
            for (let y = Universe.height - 1; y >= 0; y--) {
                Simulation.simulate(x, y);

                let cell = Universe.getCell(x, y);
                if (cell !== Material.Air) {
                    Universe.draw(x, y, colors[cell]);
                }
            }
        }

        const mouseX = Math.floor(mousePos.x / CELL_SIZE);
        const mouseY = Math.floor(mousePos.y / CELL_SIZE);

        Universe.draw(mouseX, mouseY, { r: 255, g: 0, b: 0, a: 100 });

        if (isDrawing) {
            Universe.setCell(mouseX, mouseY, brush);
        }

        const deltaTime = (performance.now() - lastTime) / 1000;
        lastTime = performance.now();
        $fpsText.html(`${(1 / deltaTime).toFixed(0)} FPS`);

        setTimeout(Universe.tick, 1000 / TARGET_FPS);
    }
}

class Simulation {
    static simulate(x: number, y: number) {
        switch (Universe.getCell(x, y)) {
            case Material.Air:
                Simulation.simulateAir(x, y);
                break;
            case Material.Sand:
                Simulation.simulateSand(x, y);
                break;
            case Material.Dirt:
                Simulation.simulateDirt(x, y);
                break;
            case Material.Life:
                Simulation.simulateLife(x, y);
                break
            case Material.Water:
                Simulation.simulateWater(x, y);
                break;
        }
    }

    static simulateLife(x: number, y: number) {
        if (Math.random() > 0.1) {
            return;
        }
        let totalAlive = Universe.getNeighborInfo(x, y, Material.Life);
        if (totalAlive < 2 || totalAlive > 3) {
            Universe.setCell(x, y, Material.Air);
        }
        if (Universe.getCell(x, y) === Material.Air && totalAlive === 3) {
            Universe.setCell(x, y, Material.Life);
        }

    }
    static simulateWater(x: number, y: number) {
        Simulation.disperse(x, y);
        Simulation.gravity(x, y);


    }
    static simulateAir(x: number, y: number) {
        Simulation.simulateLife(x, y);
    }

    static simulateDirt(x: number, y: number) {
    }

    static simulateSand(x: number, y: number) {
        Simulation.gravity(x, y);
    }

    static disperse(x: number, y: number) {
        let disperseDirection = 0;
        const leftCell =  Universe.getCell(x-1,y);
        const rightCell = Universe.getCell(x+1,y);

        if((rightCell === Material.Water && leftCell === Material.Water)){
            return;
        }

        if (Universe.getCell(x, y + 1) !== Material.Air) {
            if (Math.random() > .5) {
                //Move Left
                if ((x - 1 >= 0) && leftCell === Material.Air) {
                    disperseDirection = -1;
                }
            }
            else {
                // Move Right
                if ((x + 1 < Universe.width) && rightCell === Material.Air) {
                    disperseDirection = 1;
                }
            }
            Universe.setCell(x, y, Material.Air);
            Universe.setCell(x + disperseDirection, y, Material.Water);
        }
    }

    static gravity(x: number, y: number) {
        let setCell = Material.Air;
        const cell = Universe.getCell(x, y);
        const belowCell =  Universe.getCell(x, y + 1) ;
        const inBounds =  y < Universe.height - 1; 
        const isEmptyBelow = belowCell === Material.Air;
        const moveableThroughWater = cell === Material.Sand && belowCell === Material.Water;
        if (belowCell === Material.Water){
            setCell = Material.Water;
        }

        if (inBounds && ( isEmptyBelow || moveableThroughWater)) {
            Universe.setCell(x, y, setCell);
            Universe.setCell(x, y + 1, cell);
            Universe.drawDynamic(x, y, cell);
        }
    }
}

interface Color {
    r: number,
    g: number,
    b: number,
    a: number
}

interface MousePos {
    x: number,
    y: number;
}

canvas?.addEventListener('mousemove', ev => {
    let rect = canvas.getBoundingClientRect();
    mousePos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    };
});

canvas?.addEventListener('mousedown', ev => {
    isDrawing = true;
});

canvas?.addEventListener('mouseup', ev => {
    isDrawing = false;
});

function selectBrush(num: number) {
    $('.brush').each((index, elem) => {
        elem.classList.toggle('selected', index !== num ? false : true);
    });
    brush = num;
}

$(() => {
    const keys = Object.keys(Material);
    const $brushes = $('#brushes');
    const length = keys.length / 2;

    for (let i = 0; i < length; i++) {
        const li = document.createElement('li');
        li.classList.add('brush');
        li.innerHTML = keys[length + i];
        li.addEventListener('click', () => selectBrush(i));
        $brushes.append(li);
    }

    selectBrush(brush);

    if (canvas) {
        let width = canvas.clientWidth / CELL_SIZE;
        let height = canvas.clientHeight / CELL_SIZE;
        Universe.init(width, height);

        requestAnimationFrame(Universe.tick);
    }
});