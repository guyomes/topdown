const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: '#0f0',
    health: 10,
    speed: 5,
    draw: function() {
        console.log("Player draw called"); // Display message when player draw is called
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
    },
    update: function(dx, dy) {
        console.log(`Player update called with arguments: dx=${dx}, dy=${dy}`); // Display message when player update is called with arguments
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Keep player within canvas bounds
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    },
    shoot: function() {
        createBullet(this.x, this.y, 0, -5); // Up
        createBullet(this.x, this.y, -5, 5); // Left-down
        createBullet(this.x, this.y, 5, 5); // Right-down
    }
};

const enemies = [];
const bullets = [];

function createEnemy(x, y) {
    const enemy = {
        x: x,
        y: y,
        width: 20,
        height: 20,
        color: '#00f',
        health: 3,
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw health bar
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x, this.y - this.height, this.width, 5);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x, this.y - this.height, this.width * (this.health / 3), 5);
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

            // Enemy shoots
            if (Math.random() < 0.05) {
                createBullet(this.x, this.y, (player.x - this.x) / 10, (player.y - this.y) / 10);
            }
        }
    };
    enemies.push(enemy);
}

function createBullet(x, y, dx, dy) {
    const bullet = {
        x: x+dx*20,
        y: y+dy*20,
        width: 5,
        height: 5,
        color: '#f00',
        dx: dx,
        dy: dy,
        owner: null,
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            const speed = 5;
            this.x += (this.dx / Math.sqrt(this.dx * this.dx + this.dy * this.dy)) * speed;
            this.y += (this.dy / Math.sqrt(this.dx * this.dx + this.dy * this.dy)) * speed;

            // Check for player collision
            if (this.owner !== 'player' && this.x < player.x + player.width &&
                this.x + this.width > player.x &&
                this.y < player.y + player.height &&
                this.y + this.height > player.y) {
                console.log(`Bullet position: x=${this.x}, y=${this.y}`);
                console.log(`Player position: x=${player.x}, y=${player.y}`);
                if (this.owner !== 'player') {
                    player.health -= 1;
                    if (player.health <= 0) {
                        init();
                    }
                }
                bullets.splice(bullets.indexOf(this), 1);
            }

            // Check for enemy collision
            enemies.forEach(enemy => {
                if (this.owner !== enemy && this.x < enemy.x + enemy.width &&
                    this.x + this.width > enemy.x &&
                    this.y < enemy.y + enemy.height &&
                    this.y + this.height > enemy.y) {
                    enemy.health -= 1;
                    if (enemy.health <= 0) {
                        enemies.splice(enemies.indexOf(enemy), 1);
                    }
                    bullets.splice(bullets.indexOf(this), 1);
                }
            });
        }
    };
    if (dx === 0 && dy === -5) {
        bullet.owner = 'player';
    }
    bullets.push(bullet);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    enemies.forEach(enemy => enemy.draw());
    bullets.forEach(bullet => bullet.draw());
}

function update() {
    draw();
    enemies.forEach(enemy => enemy.update());
    bullets.forEach(bullet => bullet.update());
}

function init() {
    player.health = 10;
    enemies.length = 0;
    bullets.length = 0;

    createEnemy(0, 0);
    createEnemy(canvas.width, 0);
    createEnemy(0, canvas.height);
    createEnemy(canvas.width, canvas.height);
    update();
}

init();
setInterval(() => {
    player.shoot();
}, 100);

setInterval(update, 1000 / 60);

document.addEventListener('keydown', (e) => {
    let dx = 0, dy = 0;

    switch (e.key) {
        case 'ArrowUp':
        case 'z':
            dy = -1;
            break;
        case 'ArrowDown':
        case 's':
            dy = 1;
            break;
        case 'ArrowLeft':
        case 'q':
            dx = -1;
            break;
        case 'ArrowRight':
        case 'd':
            dx = 1;
            break;
        case 'Space':
            player.shoot();
            break;
    }

    player.update(dx, dy);
});
