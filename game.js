const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: '#0f0',
    health: 10,
    draw: function() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw health bar
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, 5);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width * (this.health / 10), 5);
    }
};

const walls = [];

function createWall() {
    const wall = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 50,
        height: 50,
        color: '#000',
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
    walls.push(wall);
}

const enemies = [];
const bullets = [];

function createEnemy(x, y) {
    const enemy = {
        x: x,
        y: y,
        width: 20,
        height: 20,
        color: '#00f',
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = 1;

            if (distance > 0) {
                this.x += (dx / distance) * speed;
                this.y += (dy / distance) * speed;
            }

            // Check for wall collisions
            walls.forEach(wall => {
                if (this.x < wall.x + wall.width &&
                    this.x + this.width > wall.x &&
                    this.y < wall.y + wall.height &&
                    this.y + this.height > wall.y) {
                    // Move enemy away from wall
                    if (dx > 0) this.x = wall.x - this.width;
                    else this.x = wall.x + wall.width;

                    if (dy > 0) this.y = wall.y - this.height;
                    else this.y = wall.y + wall.height;
                }
            });

            // Shoot bullet towards player
            if (Math.random() < 0.02) {
                createBullet(this.x, this.y, dx, dy);
            }
        }
    };
    enemies.push(enemy);
}

function createBullet(x, y, dx, dy) {
    const bullet = {
        x: x,
        y: y,
        width: 5,
        height: 5,
        color: '#f00',
        dx: dx,
        dy: dy,
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            const speed = 5;
            this.x += (this.dx / Math.sqrt(this.dx * this.dx + this.dy * this.dy)) * speed;
            this.y += (this.dy / Math.sqrt(this.dx * this.dx + this.dy * this.dy)) * speed;

            // Check for player collision
            if (this.x < player.x + player.width &&
                this.x + this.width > player.x &&
                this.y < player.y + player.height &&
                this.y + this.height > player.y) {
                player.health -= 1;
                if (player.health <= 0) {
                    init();
                }
                bullets.splice(bullets.indexOf(this), 1);
            }
        }
    };
    bullets.push(bullet);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    walls.forEach(wall => wall.draw());
    enemies.forEach(enemy => enemy.draw());
    bullets.forEach(bullet => bullet.draw());
}

function update() {
    enemies.forEach(enemy => enemy.update());
    bullets.forEach(bullet => bullet.update());
    draw();
    requestAnimationFrame(update);
}

function init() {
    player.health = 10;
    walls.length = 0;
    enemies.length = 0;
    bullets.length = 0;

    for (let i = 0; i < 10; i++) {
        createWall();
    }
    createEnemy(0, 0);
    createEnemy(canvas.width, 0);
    createEnemy(0, canvas.height);
    createEnemy(canvas.width, canvas.height);
    update();
}

init();
