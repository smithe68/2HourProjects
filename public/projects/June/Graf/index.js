/*
    get function from user somehow.....
    get bounds from the user somehow....
    get how many points the user wants to create.
    set loop variables based on bounds so we always have the right number of points starting and ending at bounds.
    loop through the function and record inputs and outputs
    send list of points to another function that draws the line between each point
    (potentially optimise by drawing as we calculate?)
*/

const canvas = $('canvas')[0]; // Canvas
const ctx = canvas.getContext('2d'); // Canvas Context
const $equation = $('#equation'); // Equation Input Box
const $zoom = $('#zoom-slider'); // Zoom Slider

let RANGE = 600; // Like zoom? 
let POINTCOUNT = RANGE * $zoom.val() * 25;
let x = 0.0;

// Take value from equation input box and parse
function parseEquation() {
    const points = [];
    let adder = (RANGE * 2) / POINTCOUNT;

    for (let i = -RANGE; i <= RANGE; i = i + adder) {
        x = i;
        points.push({ input: x, output: new Function(`return ${$equation.val()};`)() });
    }

    return points;
}

// Clears the graph
function clear() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillRect(canvas.clientWidth / 2, 0, 2, canvas.clientHeight);
    ctx.fillRect(0, canvas.clientHeight / 2, canvas.clientWidth, 2);
    ctx.font = "12px Arial";
    ctx.fillText("+ x", canvas.clientWidth - 20, canvas.clientHeight / 2 - 10);
    ctx.fillText("- x", 0, canvas.clientHeight / 2 - 10);
    ctx.fillText("- y", canvas.clientWidth / 2 + 10, canvas.clientHeight - 5);
    ctx.fillText("+ y", canvas.clientWidth / 2 + 10, 10);
    ctx.fillText("(0, 0)", canvas.clientWidth / 2 + 10, canvas.clientHeight / 2 + 20);
}

function mapToCanvas(point) {
    return {
        input: (point.input * RANGE * 0.1 * $zoom.val() + canvas.clientWidth / 2),
        output: (-(point.output * RANGE * 0.1 * $zoom.val() - canvas.clientHeight / 2))
    };
}

// Renders the equation
function render(points) {
    ctx.beginPath();

    const first = mapToCanvas(points[0]);
    ctx.moveTo(first.input, first.output);
    // Draw lines here?
    for (let i = 1; i < POINTCOUNT; i++) {
        const p = mapToCanvas(points[i]);
        ctx.lineTo(p.input, p.output);
    }
    ctx.stroke();
    ctx.closePath();
}

// Graf Button Click
$('#graf-btn').click(() => {
    clear();
    render(parseEquation());
});

$zoom.change(() => {
    clear();
    render(parseEquation());
});

// On Document Loaded
$(() => {
    clear();
    render(parseEquation());
});