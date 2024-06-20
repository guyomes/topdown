const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: '#0f0',
    draw: function() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

const enemies = [];

function createEnemy() {
    const enemy = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 20,
        height: 20,
        color: '#f00',
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
    enemies.push(enemy);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    enemies.forEach(enemy => enemy.draw());
}

function update() {
    draw();
    requestAnimationFrame(update);
}

function init() {
    setInterval(createEnemy, 1000);
    update();
}

init();
