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
        createBullet(this.x, this.y, 0, -5);
    }
};

const walls = [];

function createWall() {
    const vertices = [];
    const numVertices = 3 + Math.floor(Math.random() * 3); // Random number of vertices between 3 and 5
    for (let i = 0; i < numVertices; i++) {
        vertices.push({
            x: Math.random() * canvas.width * 0.5, // Make walls smaller by reducing the range
            y: Math.random() * canvas.height * 0.5  // Make walls smaller by reducing the range
        });
    }

    // Sort vertices to ensure they are in clockwise order
    const centerX = vertices.reduce((sum, vertex) => sum + vertex.x, 0) / vertices.length;
    const centerY = vertices.reduce((sum, vertex) => sum + vertex.y, 0) / vertices.length;
    vertices.sort((a, b) => {
        const angleA = Math.atan2(a.y - centerY, a.x - centerX);
        const angleB = Math.atan2(b.y - centerY, b.x - centerX);
        return angleA - angleB;
    });

    const wall = {
        vertices: vertices,
        color: '#000',
        draw: function() {
            ctx.beginPath();
            ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
            for (let i = 1; i < this.vertices.length; i++) {
                ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
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

            // Check for wall collisions
            walls.forEach(wall => {
                if (isPointInPolygon(this.x, this.y, wall.vertices)) {
                    bullets.splice(bullets.indexOf(this), 1);
                }
            });

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

            // Check for enemy collision
            enemies.forEach(enemy => {
                if (this.x < enemy.x + enemy.width &&
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
    walls.forEach(wall => wall.draw());
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
            document.getElementById('editCounter').innerText = `ArrowUp pressed - Player Position: (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`;
            break;
        case 'ArrowDown':
        case 's':
            dy = 1;
            document.getElementById('editCounter').innerText = `ArrowDown pressed - Player Position: (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`;
            break;
        case 'ArrowLeft':
        case 'q':
            dx = -1;
            document.getElementById('editCounter').innerText = `ArrowLeft pressed - Player Position: (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`;
            break;
        case 'ArrowRight':
        case 'd':
            dx = 1;
            document.getElementById('editCounter').innerText = `ArrowRight pressed - Player Position: (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`;
            break;
        case 'Space':
            player.shoot();
            break;
    }

    player.update(dx, dy);
});

function findPath(startX, startY, endX, endY) {
    const grid = createGrid();
    const startNode = grid[Math.floor(startY / 50)][Math.floor(startX / 50)];
    const endNode = grid[Math.floor(endY / 50)][Math.floor(endX / 50)];
    const openList = [];
    const closedList = [];
    openList.push(startNode);

    while (openList.length > 0) {
        let currentNode = openList[0];
        let currentIndex = 0;
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentNode = openList[i];
                currentIndex = i;
            }
        }

        openList.splice(currentIndex, 1);
        closedList.push(currentNode);

        if (currentNode === endNode) {
            const path = [];
            let current = currentNode;
            while (current) {
                path.push({ x: current.x * 50 + 25, y: current.y * 50 + 25 });
                current = current.parent;
            }
            return path.reverse();
        }

        const children = [];
        const directions = [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 0 },                  { dx: 1, dy: 0 },
            { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
        ];
        for (const direction of directions) {
            const nodeX = currentNode.x + direction.dx;
            const nodeY = currentNode.y + direction.dy;

            if (nodeX < 0 || nodeX >= grid[0].length || nodeY < 0 || nodeY >= grid.length) {
                continue;
            }

            if (grid[nodeY][nodeX].isWall) {
                continue;
            }

            children.push(grid[nodeY][nodeX]);
        }

        for (const child of children) {
            if (closedList.includes(child)) {
                continue;
            }

            child.g = currentNode.g + 1;
            child.h = Math.sqrt((child.x - endNode.x) ** 2 + (child.y - endNode.y) ** 2);
            child.f = child.g + child.h;
            child.parent = currentNode;

            if (!openList.includes(child)) {
                openList.push(child);
            }
        }
    }

    return [];
}

function createGrid() {
    const grid = [];
    const rows = Math.ceil(canvas.height / 50);
    const cols = Math.ceil(canvas.width / 50);

    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            const isWall = walls.some(wall => {
                return isPointInPolygon(x * 50 + 25, y * 50 + 25, wall.vertices);
            });
            row.push({ x, y, isWall, g: 0, h: 0, f: 0, parent: null });
        }
        grid.push(row);
    }

    return grid;
}

function isPointInPolygon(x, y, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;

        const intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
