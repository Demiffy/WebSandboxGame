document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sandbox');
    const ctx = canvas.getContext('2d');
    const cursorHighlight = document.getElementById('cursor-highlight');
    const selectedElementDisplay = document.getElementById('selected-element');

    const grid = [];
    const gridSize = 10; // 10x10 pixels per cell
    let width, height;
    let isMouseDown = false;
    let fireX = -1, fireY = -1;
    let shakeDuration = 0;
    const maxShakeDuration = 20;

    const materials = {
        'sand': { color: '#f4e542', density: 2 },
        'water': { color: '#00bfff', density: 1 },
        'stone': { color: '#8c8c89', density: 3 },
        'wood': { color: '#8B4513', density: 3 },
        'burning_wood': { color: '#A52A2A', density: 3, burnTime: 10000, spreadTime: 2000, burnStart: null },
        'dirt': { color: '#654321', density: 2 },
        'fire': { color: '#ff4500', density: 0 },
        'steam': { color: '#c0c0c0', density: 0 },
        'glass': { color: '#e0e0e0', density: 4 },
        'gunpowder': { color: '#4f4f4f', density: 2 }
    };

    let selectedMaterial = 'sand';

    // Initialize grid
    function initGrid() {
        width = Math.floor(canvas.width / gridSize);
        height = Math.floor(canvas.height / gridSize);
        for (let x = 0; x < width; x++) {
            grid[x] = [];
            for (let y = 0; y < height; y++) {
                grid[x][y] = { type: 'empty', color: null };
            }
        }
    }

    function draw() {
        if (shakeDuration > 0) {
            const dx = Math.random() * 5 - 2.5;
            const dy = Math.random() * 5 - 2.5;
            ctx.setTransform(1, 0, 0, 1, dx, dy);
            shakeDuration--;
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (grid[x][y].type !== 'empty') {
                    ctx.fillStyle = grid[x][y].color;
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                }
            }
        }
        if (fireX !== -1 && fireY !== -1) {
            ctx.fillStyle = materials['fire'].color;
            ctx.fillRect(fireX * gridSize, fireY * gridSize, gridSize, gridSize);
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth - 60;
        canvas.height = window.innerHeight;
        initGrid();
        draw();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function explode(x, y) {
        const radius = 3;
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const dist = Math.sqrt(i * i + j * j);
                if (dist <= radius) {
                    const newX = x + i;
                    const newY = y + j;
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        if (grid[newX][newY].type === 'gunpowder') {
                            grid[newX][newY] = { type: 'exploded', color: null }; // Mark as exploded
                            explode(newX, newY);
                        }
                        grid[newX][newY] = { type: 'empty', color: null };
                    }
                }
            }
        }
        shakeDuration = maxShakeDuration;
    }

    function update() {
        const now = Date.now();
        for (let x = 0; x < width; x++) {
            for (let y = height - 1; y >= 0; y--) {
                if (grid[x][y].type === 'sand' || grid[x][y].type === 'gunpowder') {
                    // Sand and gunpowder physics
                    if (y < height - 1 && grid[x][y + 1].type === 'empty') {
                        grid[x][y + 1] = grid[x][y];
                        grid[x][y] = { type: 'empty', color: null };
                    } else if (y < height - 1 && grid[x][y + 1].type === 'water') {
                        grid[x][y + 1] = grid[x][y];
                        grid[x][y] = { type: 'water', color: materials['water'].color };
                    }
                } else if (grid[x][y].type === 'water') {
                    // Water physics
                    if (y < height - 1 && grid[x][y + 1].type === 'empty') {
                        grid[x][y + 1] = grid[x][y];
                        grid[x][y] = { type: 'empty', color: null };
                    } else if (x > 0 && y < height - 1 && grid[x - 1][y + 1].type === 'empty' && grid[x - 1][y].type === 'empty') {
                        grid[x - 1][y + 1] = grid[x][y];
                        grid[x][y] = { type: 'empty', color: null };
                    } else if (x < width - 1 && y < height - 1 && grid[x + 1][y + 1].type === 'empty' && grid[x + 1][y].type === 'empty') {
                        grid[x + 1][y + 1] = grid[x][y];
                        grid[x][y] = { type: 'empty', color: null };
                    }
                } else if (grid[x][y].type === 'fire') {
                    // Fire interaction
                    if (y > 0 && grid[x][y - 1].type === 'water') {
                        grid[x][y - 1] = { type: 'steam', color: materials['steam'].color };
                    }
                    if (y < height - 1 && grid[x][y + 1].type === 'water') {
                        grid[x][y + 1] = { type: 'steam', color: materials['steam'].color };
                    }
                    if (x > 0 && grid[x - 1][y].type === 'water') {
                        grid[x - 1][y] = { type: 'steam', color: materials['steam'].color };
                    }
                    if (x < width - 1 && grid[x + 1][y].type === 'water') {
                        grid[x + 1][y] = { type: 'steam', color: materials['steam'].color };
                    }
                    if (y > 0 && grid[x][y - 1].type === 'sand') {
                        grid[x][y - 1] = { type: 'glass', color: materials['glass'].color };
                    }
                    if (y < height - 1 && grid[x][y + 1].type === 'sand') {
                        grid[x][y + 1] = { type: 'glass', color: materials['glass'].color };
                    }
                    if (x > 0 && grid[x - 1][y].type === 'sand') {
                        grid[x - 1][y] = { type: 'glass', color: materials['glass'].color };
                    }
                    if (x < width - 1 && grid[x + 1][y].type === 'sand') {
                        grid[x + 1][y] = { type: 'glass', color: materials['glass'].color };
                    }
                    if (y > 0 && grid[x][y - 1].type === 'gunpowder') {
                        explode(x, y - 1);
                    }
                    if (y < height - 1 && grid[x][y + 1].type === 'gunpowder') {
                        explode(x, y + 1);
                    }
                    if (x > 0 && grid[x - 1][y].type === 'gunpowder') {
                        explode(x - 1, y);
                    }
                    if (x < width - 1 && grid[x + 1][y].type === 'gunpowder') {
                        explode(x + 1, y);
                    }
                } else if (grid[x][y].type === 'wood') {
                    // Wood to burning wood
                    if (grid[x][y].burnStart && now - grid[x][y].burnStart >= 2000) {
                        grid[x][y] = { type: 'burning_wood', color: materials['burning_wood'].color, burnStart: now };
                    }
                } else if (grid[x][y].type === 'burning_wood') {
                    // Burning wood spread and burn out
                    if (now - grid[x][y].burnStart >= materials['burning_wood'].burnTime) {
                        grid[x][y] = { type: 'empty', color: null };
                    } else if (now - grid[x][y].burnStart >= materials['burning_wood'].spreadTime) {
                        if (y > 0 && grid[x][y - 1].type === 'wood' && !grid[x][y - 1].burnStart) {
                            grid[x][y - 1].burnStart = now;
                        }
                        if (y < height - 1 && grid[x][y + 1].type === 'wood' && !grid[x][y + 1].burnStart) {
                            grid[x][y + 1].burnStart = now;
                        }
                        if (x > 0 && grid[x - 1][y].type === 'wood' && !grid[x - 1][y].burnStart) {
                            grid[x - 1][y].burnStart = now;
                        }
                        if (x < width - 1 && grid[x + 1][y].type === 'wood' && !grid[x + 1][y].burnStart) {
                            grid[x + 1][y].burnStart = now;
                        }
                    }
                } else if (grid[x][y].type === 'steam') {
                    // Steam rising slowly
                    if (Math.random() < 0.1) {
                        if (y > 0 && grid[x][y - 1].type === 'empty') {
                            grid[x][y - 1] = grid[x][y];
                            grid[x][y] = { type: 'empty', color: null };
                        } else if (x > 0 && y > 0 && grid[x - 1][y - 1].type === 'empty') {
                            grid[x - 1][y - 1] = grid[x][y];
                            grid[x][y] = { type: 'empty', color: null };
                        } else if (x < width - 1 && y > 0 && grid[x + 1][y - 1].type === 'empty') {
                            grid[x + 1][y - 1] = grid[x][y];
                            grid[x][y] = { type: 'empty', color: null };
                        }
                    }
                }
            }
        }
        draw();
        requestAnimationFrame(update);
    }

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / gridSize) * gridSize;
        const y = Math.floor((event.clientY - rect.top) / gridSize) * gridSize;
        cursorHighlight.style.left = (x + 60) + 'px';
        cursorHighlight.style.top = y + 'px';

        if (isMouseDown && selectedMaterial === 'fire') {
            const gridX = Math.floor((event.clientX - rect.left) / gridSize);
            const gridY = Math.floor((event.clientY - rect.top) / gridSize);
            if (fireX !== -1 && fireY !== -1 && (fireX !== gridX || fireY !== gridY)) {
                fireX = -1;
                fireY = -1;
            }
            if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
                fireX = gridX;
                fireY = gridY;

                // Interact with underlying blocks
                if (grid[fireX][fireY].type === 'water') {
                    grid[fireX][fireY] = { type: 'steam', color: materials['steam'].color };
                    fireX = -1;
                    fireY = -1;
                } else if (grid[fireX][fireY].type === 'wood') {
                    grid[fireX][fireY] = { type: 'burning_wood', color: materials['burning_wood'].color, burnStart: Date.now() };
                } else if (grid[fireX][fireY].type === 'sand') {
                    grid[fireX][fireY] = { type: 'glass', color: materials['glass'].color };
                } else if (grid[fireX][fireY].type === 'gunpowder') {
                    explode(fireX, fireY);
                    fireX = -1;
                    fireY = -1;
                }

                draw();
            }
        }
    });

    canvas.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / gridSize);
        const y = Math.floor((event.clientY - rect.top) / gridSize);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (selectedMaterial === 'remover') {
                grid[x][y] = { type: 'empty', color: null };
            } else if (selectedMaterial !== 'fire') {
                grid[x][y] = { type: selectedMaterial, color: materials[selectedMaterial].color };
            }
        }
        draw();
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        if (fireX !== -1 && fireY !== -1) {
            fireX = -1;
            fireY = -1;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        if (fireX !== -1 && fireY !== -1) {
            fireX = -1;
            fireY = -1;
        }
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedMaterial = item.id;
            selectedElementDisplay.textContent = 'Selected: ' + selectedMaterial.charAt(0).toUpperCase() + selectedMaterial.slice(1);
        });
    });

    update();
});
