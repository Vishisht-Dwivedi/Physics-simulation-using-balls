console.log("Connected");
const canvas = document.querySelector('canvas');

let CANVAS_WIDTH = window.innerWidth / 1.1;
let CANVAS_HEIGHT = window.innerHeight / 1.2;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
window.addEventListener('resize', () => {
    CANVAS_WIDTH = window.innerWidth / 1.1;
    CANVAS_HEIGHT = window.innerHeight / 1.2;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    circles = init();
});
const ctx = canvas.getContext('2d');
let gravity = 0.005;
let elasticity = 0.8;
let airDrag = 0.001;
const density = 0.1;
const colorArray = ["#B1F0F7", "#81BFDA", "#F5F0CD", "#FADA7A"];

function boxCollisionHandling(circle) {
    if (circle.x + circle.radius + circle.velocity.x >= CANVAS_WIDTH || circle.x - circle.radius <= 0) {
        circle.velocity.x = -(circle.velocity.x * elasticity);
        // to prevent tunneling and overlays... check yt for refreshing
        if (circle.x + circle.radius >= CANVAS_WIDTH) {
            circle.x = CANVAS_WIDTH - circle.radius;
        } else if (circle.x - circle.radius <= 0) {
            circle.x = circle.radius;
        }
    }
    if (circle.y + circle.radius + circle.velocity.y >= CANVAS_HEIGHT || circle.y - circle.radius <= 0) {
        circle.velocity.y = -(circle.velocity.y * elasticity);
        if (circle.y + circle.radius >= CANVAS_HEIGHT) {
            circle.y = CANVAS_HEIGHT - circle.radius;
        } else if (circle.y - circle.radius <= 0) {
            circle.y = circle.radius;
        }
    }
}

function velocityAfterCollision(circle1, circle2) {
    let v1x = ((circle1.mass - circle2.mass) * circle1.velocity.x + 2 * circle2.mass * circle2.velocity.x) / (circle1.mass + circle2.mass);
    let v1y = ((circle1.mass - circle2.mass) * circle1.velocity.y + 2 * circle2.mass * circle2.velocity.y) / (circle1.mass + circle2.mass);

    let v2x = ((circle2.mass - circle1.mass) * circle2.velocity.x + 2 * circle1.mass * circle1.velocity.x) / (circle1.mass + circle2.mass);
    let v2y = ((circle2.mass - circle1.mass) * circle2.velocity.y + 2 * circle1.mass * circle1.velocity.y) / (circle1.mass + circle2.mass);

    circle1.velocity.x = v1x;
    circle1.velocity.y = v1y;
    circle2.velocity.x = v2x;
    circle2.velocity.y = v2y;
    //Code from the web to fix stickyness and tunneling
    const overlap = circle1.radius + circle2.radius - distance(circle1.x, circle1.y, circle2.x, circle2.y);
    if (overlap > 0) {
        let angle = Math.atan2(circle2.y - circle1.y, circle2.x - circle1.x);
        let pushDistance = overlap / 2;
        circle1.x -= Math.cos(angle) * pushDistance;
        circle1.y -= Math.sin(angle) * pushDistance;

        circle2.x += Math.cos(angle) * pushDistance;
        circle2.y += Math.sin(angle) * pushDistance;
    }
}

function ballCollisionHandling(circles) {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (i === j) continue;
            if (checkCircleCollision(circles[i], circles[j])) {
                velocityAfterCollision(circles[i], circles[j]);
            }
        }
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function checkCircleCollision(circle1, circle2) {
    let dist = distance(circle1.x, circle1.y, circle2.x, circle2.y);
    return dist < (circle1.radius + circle2.radius);
}
function randomInRange(low, high) {
    let x = Math.random() * (low + high);
    if (x < low || x > high) return (low + high) / 2;
    return x;
}

function addAirDrag(circle) {
    if ((circle.velocity.y > 0)) {
        circle.velocity.y -= airDrag;
    } else {
        circle.velocity.y += airDrag;
    }
    if (circle.velocity.x > 0) {
        circle.velocity.x -= airDrag;
    } else {
        circle.velocity.x += airDrag;
    }
}

function addGravity(circle) {
    circle.velocity.y += gravity;
}
class Circle {
    constructor(x, y, radius, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.mass = density * (Math.PI * Math.pow(radius, 2));
        this.radius = radius;
        this.velocity = {
            x: dx,
            y: dy
        }
        this.color = color;
        this.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.stroke();
        }
        this.update = function () {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            addGravity(this);
            addAirDrag(this);
            boxCollisionHandling(this);
        }
    }
}


function init() {
    const circles = [];
    for (let i = 0; i < 200; i++) {
        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;
        let radius = randomInRange(0.008 * CANVAS_WIDTH, 0.015 * CANVAS_WIDTH);
        let x = randomInRange(2 * radius, CANVAS_WIDTH - 2 * radius);
        let y = randomInRange(2 * radius, CANVAS_HEIGHT - 2 * radius);
        let color = colorArray[Math.floor(Math.random() * colorArray.length)];
        const circle = new Circle(x, y, radius, dx, dy, color);
        circles.push(circle);
    }
    return circles;
}
function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (let i = 0; i < circles.length; i++) {
        circles[i].draw();
    }
    for (let i = 0; i < circles.length; i++) {
        circles[i].update();
    }
    ballCollisionHandling(circles);
    requestAnimationFrame(animate);
}

let circles = init();
animate();
// Sliders
const gravitySlider = document.querySelector("#gravity");
gravitySlider.addEventListener("change", (e) => {
    gravity = parseFloat(e.target.value);
});
const airDragSlider = document.querySelector("#airDrag");
airDragSlider.addEventListener("change", (e) => {
    airDrag = parseFloat(e.target.value);
});
const elasticitySlider = document.querySelector("#elasticity");
elasticitySlider.addEventListener("change", (e) => {
    elasticity = parseFloat(e.target.value);
    console.log(elasticity);
});