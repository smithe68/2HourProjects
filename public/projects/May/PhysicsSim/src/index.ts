import $ from 'jquery';

/*
    Pre Programming Notes:
    =============================================
    Create cellular automata, that are full of a cell object depending on the object type
    different rules will be followed. Things physics has that we want to represent are Gravity
    and Wind.
*/

// UTILITY DATA STRUCTURES
// ==============================

enum Material {
    Air, Dirt, Sand, Life, Water
}

class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

interface Point {
    x: number, y: number;
}

// CONSTANTS
// ==============================

const CELL_SIZE: number = 8;
const TARGET_FPS: number = 60;

const COLORS: Record<Material, Color> = {
    [Material.Air]: new Color(0, 0, 0, 0),
    [Material.Dirt]: new Color(100, 100, 100),
    [Material.Sand]: new Color(120, 120, 0),
    [Material.Life]: new Color(10, 200, 30, 85),
    [Material.Water]: new Color(0, 0, 255, 50)
};

// ==============================

const $canvas = <JQuery<HTMLCanvasElement>>$('canvas');
const ctx = (<HTMLCanvasElement>$canvas[0])?.getContext('2d');

const $fpsText = $('#fps');

let lastTime = 0;

let mousePos: Point = { x: 0, y: 0 };
let isDrawing: boolean = false;
let brush: Material = Material.Sand;

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
            let color = COLORS[cell as Material];
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    static async tick() {
        if ($canvas === null) { return; }
        lastTime = performance.now();

        const frame = await createImageBitmap(Universe.drawTarget);
        ctx?.drawImage(frame, 0, 0, $canvas[0].width, $canvas[0].height);

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
                    Universe.draw(x, y, COLORS[cell as Material]);
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
        const leftCell = Universe.getCell(x - 1, y);
        const rightCell = Universe.getCell(x + 1, y);

        if ((rightCell === Material.Water && leftCell === Material.Water)) {
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
        const belowCell = Universe.getCell(x, y + 1);
        const inBounds = y < Universe.height - 1;
        const isEmptyBelow = belowCell === Material.Air;
        const moveableThroughWater = cell === Material.Sand && belowCell === Material.Water;
        if (belowCell === Material.Water) {
            setCell = Material.Water;
        }

        if (inBounds && (isEmptyBelow || moveableThroughWater)) {
            Universe.setCell(x, y, setCell);
            Universe.setCell(x, y + 1, cell);
            Universe.drawDynamic(x, y, cell);
        }
    }
}

$canvas.mousemove(ev => {
    let rect = $canvas[0].getBoundingClientRect();
    mousePos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    };
});

$canvas.mousedown(() => { isDrawing = true; });
$canvas.mouseup(() => { isDrawing = false; });

function selectBrush(mat: Material) {
    $('.brush').each((index, elem) => {
        elem.classList.toggle('selected', index !== mat ? false : true);
    });
    brush = mat;
}

// JQUERY EVENTS
// ==============================

$(() => {
    const $brushes = $('#brushes');
    const keys = Object.keys(Material);
    const length = keys.length / 2;

    for (let i = 0; i < length; i++) {
        const li = document.createElement('li');
        li.classList.add('brush');
        li.innerHTML = keys[length + i];
        li.addEventListener('click', () => selectBrush(i));
        $brushes.append(li);
    }

    selectBrush(brush);

    if ($canvas) {
        let width = $canvas[0].clientWidth / CELL_SIZE;
        let height = $canvas[0].clientHeight / CELL_SIZE;
        Universe.init(width, height);

        requestAnimationFrame(Universe.tick);
    }
});