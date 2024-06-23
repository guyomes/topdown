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
    dx: 0,
    dy: 0,
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
    update: function() {
        console.log(`Player update called with arguments: dx=${this.dx}, dy=${this.dy}`); // Display message when player update is called with arguments
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Keep player within canvas bounds
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    },
    shoot: function() {
        //createBullet(this.x, this.y, 0, -5, 'player'); // Up
        //createBullet(this.x, this.y, -5, 5, 'player'); // Left-down
        //createBullet(this.x, this.y, 5, 5, 'player'); // Right-down
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
                createBullet(this.x, this.y, (player.x - this.x) / 10, (player.y - this.y) / 10, 'enemy');
            }
        }
    };
    enemies.push(enemy);
}

function createBullet(x, y, dx, dy, owner) {
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalDx = dx / length;
    const normalDy = dy / length;
    const bullet = {
        x: x+normalDx*50,
        y: y+normalDy*50,
        width: 5,
        height: 5,
        color: '#f00',
        dx: normalDx,
        dy: normalDy,
        owner: owner,
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            const speed = 2; // Decreased bullet speed
            this.x += (this.dx / Math.sqrt(this.dx * this.dx + this.dy * this.dy)) * speed;
            this.y += (this.dy / Math.sqrt(this.dx * this.dx + this.dy * this.dy)) * speed;

            // Check for player collision
            if (this.owner !== 'player' && this.x < player.x + player.width &&
                this.x + this.width > player.x &&
                this.y < player.y + player.height &&
                this.y + this.height > player.y) {
                console.log(`Bullet owner: ${this.owner}`);
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
    player.update(); // Call player update
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
    switch (e.key) {
        case 'ArrowUp':
        case 'z':
            player.dy = -1;
            break;
        case 'ArrowDown':
        case 's':
            player.dy = 1;
            break;
        case 'ArrowLeft':
        case 'q':
            player.dx = -1;
            break;
        case 'ArrowRight':
        case 'd':
            player.dx = 1;
            break;
        case 'Space':
            player.shoot();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'ArrowDown':
        case 's':
            player.dy = 0;
            break;
        case 'ArrowLeft':
        case 'q':
        case 'ArrowRight':
        case 'd':
            player.dx = 0;
            break;
    }
});

document.addEventListener('touchstart', (e) => {
    const mobileControls = document.getElementById('mobile-controls');
    mobileControls.style.display = 'block';
    const up = document.getElementById('up');
    const down = document.getElementById('down');
    const left = document.getElementById('left');
    const right = document.getElementById('right');
    const shoot = document.getElementById('shoot');

    up.addEventListener('touchstart', () => {
        player.dy = -1;
    });

    up.addEventListener('touchend', () => {
        player.dy = 0;
    });

    down.addEventListener('touchstart', () => {
        player.dy = 1;
    });

    down.addEventListener('touchend', () => {
        player.dy = 0;
    });

    left.addEventListener('touchstart', () => {
        player.dx = -1;
    });

    left.addEventListener('touchend', () => {
        player.dx = 0;
    });

    right.addEventListener('touchstart', () => {
        player.dx = 1;
    });

    right.addEventListener('touchend', () => {
        player.dx = 0;
    });

    shoot.addEventListener('touchstart', () => {
        player.shoot();
    });
});
