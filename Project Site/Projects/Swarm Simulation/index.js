const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const drones = [];

let mousePos = {
    x: 200, y: 200
};

const mouseInfluence = .03;

class Drone {
    constructor(x, y, velX, velY, color, size, id) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        //this.color = `#${id + 3900}`;
        this.color = color;
        this.size = size;
        this.id = id
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        if ((this.x + this.size) >= ctx.canvas.clientWidth) this.velX = -(this.velX) * 1.1;
        if ((this.y + this.size) >= ctx.canvas.clientHeight) this.velY = -(this.velY) * 1.1;

        if ((this.x - this.size) <= 0) this.velX = -this.velX * 1.1;
        if ((this.y - this.size) <= 0) this.velY = -this.velY * 1.1;

        this.x += this.velX;
        this.y += this.velY;
    }

    isColliding() {
        for (let i = 0; i < drones.length; i++) {
            if (!(this === drones[i])) {
                return distance(this.x, this.y, drones[i].x, drones[i].y) < this.size + drones[i].size;
            }
        }
    }
}

function distance(x0, y0, x1, y1) {
    let dx = x0 - x1;
    let dy = y0 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function spawnDrone(x, y, velX, velY) {
    let r = Math.random() * 255;
    let g = Math.random() * 255;
    let b = Math.random() * 255;

    let drone = new Drone(x, y, velX, velY, `rgb(${r}, ${b}, ${b})`, 3, drones.length);
    drones.push(drone);
}

function destroyDrone() {
    drones.pop();
}

function loop() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    for (let i = 0; i < drones.length; i++) {
        let dirToMouseX = mousePos.x - drones[i].x;
        let dirToMouseY = mousePos.y - drones[i].y;

        let distToMouse = distance(mousePos.x, mousePos.y,
            drones[i].x, drones[i].y);

        let avgVelX = 0;
        let avgVelY = 0;
        let avgSize = 0;

        for (let j = 0; j < drones.length; j++) {
            if (distance(drones[i].x, drones[i].y, drones[j].x, drones[j].y) < 5) {
                avgVelX += drones[j].x;
                avgVelY += drones[j].y;
                avgSize += 1;
            }
        }

        avgVelX /= avgSize;
        avgVelY /= avgSize;

        let dist = distToMouse / 10000;
        if (Math.random() > .8) {
            drones[i].velX += (dirToMouseX * mouseInfluence * dist);
            drones[i].velY += (dirToMouseY * mouseInfluence * dist);
        }


        drones[i].velY *= .985;
        drones[i].velX *= .985;

        drones[i].update();
        drones[i].render(ctx);
    }

    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(mousePos.x, mousePos.y, 8, 8);

    requestAnimationFrame(loop);
}

function spawnABunchOfDrones(abunch) {
    for (let i = 0; i < abunch; i++) {
        spawnDrone(Math.random() * (ctx.canvas.clientWidth - 100),
            Math.random() * (ctx.canvas.clientHeight - 100), .0001, .0001);
    }
}

canvas.addEventListener('mousemove', ev => {
    let rect = canvas.getBoundingClientRect();
    mousePos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    };
});

spawnABunchOfDrones(1000);

requestAnimationFrame(loop);