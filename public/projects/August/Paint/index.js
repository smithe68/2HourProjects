const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let mousePos = {
    x: 200, y: 200
};

let brushPos = mousePos;
let isDrawing = false;
let color = 000000;
let brushType = 1;
let lastTick = performance.now();
let actionList = [];
const lerpSpeed = 1;
const updateSpeed = 10;
const spacing = 100;
let cycle = 0;

let defaultBrushSize = 8;
let brushSize = defaultBrushSize;

canvas.addEventListener('mousedown',async _ =>{
    await addUndo();
    isDrawing = true;
    requestAnimationFrame(loop);
    brushPos = mousePos;
});

document.addEventListener('onload', async () => {
    await addUndo();
});

async function addUndo() {
    // Save canvas as image and add to undo stack
    actionList.push(await createImageBitmap(canvas));
}

function undo(){
    console.log(actionList.length);
    if(actionList.length > 0){
        const v = actionList.pop();
        console.log(v);
        clear();
        ctx.drawImage(v, 0, 0);
    }
}
canvas.addEventListener('mouseup', async ev =>{
    isDrawing = false;
});

canvas.addEventListener('mouseleave',async ev =>{
    isDrawing = false;
});

canvas.addEventListener('mousemove', ev => {
    let rect = canvas.getBoundingClientRect();
    mousePos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    };
});

window.addEventListener('keydown', ev => {
    if (ev.ctrlKey) {
        if (ev.keyCode == 90) {
            undo();
        }
    }
});

const colorSelector = document.querySelector("#color");
const brushSelector = document.querySelector("#brushes");
const velocityBasedInput = document.querySelector("#velocity-size");
const sizeMarker = document.querySelector("#size");

function clear() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

document.querySelector('#clear').addEventListener('click', _ => {
    clear();
});

function loop() {

    if(!isDrawing){
        return;
    }
  
    ctx.fillStyle = colorSelector.value;
    if(velocityBasedInput.checked){
        const dx = (mousePos.x - brushPos.x);
        const dy = (mousePos.y - brushPos.y);
        const newSize = Math.sqrt(dx * dx + dy * dy);
        brushSize += (newSize - brushSize) * 0.1;
    }else{
        brushSize = parseInt(sizeMarker.value);
    }

    switch(parseInt(brushSelector.value)){
        case 0:
            for (let i = 0; i < spacing; i++) {
                brushPos.x += (mousePos.x - brushPos.x) * lerpSpeed * 0.01;
                brushPos.y += (mousePos.y - brushPos.y) * lerpSpeed * 0.01;
                ctx.beginPath();
                ctx.arc(brushPos.x, brushPos.y, brushSize, 0, Math.PI * 2);
                ctx.fill();
            }
        break; 

        case 1:
            ctx.beginPath();
            ctx.moveTo(brushPos.x, brushPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
        break;

        case 2:
            for (let i = 0; i < spacing; i++) {
                brushPos.x += (mousePos.x - brushPos.x) * lerpSpeed * 0.01;
                brushPos.y += (mousePos.y - brushPos.y) * lerpSpeed * 0.01;
                ctx.fillRect(brushPos.x, brushPos.y, 8, 8);
            }
        break;

        case 3:
            ctx.fillRect(mousePos.x, mousePos.y, 8, 8);
        break;
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);