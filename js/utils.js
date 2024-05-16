function draw(ctx, canvas, state) {
    if (state.shakeDuration > 0) {
        const dx = Math.random() * 5 - 2.5;
        const dy = Math.random() * 5 - 2.5;
        ctx.setTransform(1, 0, 0, 1, dx, dy);
        state.shakeDuration--;
    } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < state.width; x++) {
        for (let y = 0; y < state.height; y++) {
            if (state.grid[x][y].type !== 'empty') {
                ctx.fillStyle = state.grid[x][y].color;
                ctx.fillRect(x * state.gridSize, y * state.gridSize, state.gridSize, state.gridSize);
            }
        }
    }
    if (state.fireX !== -1 && state.fireY !== -1) {
        ctx.fillStyle = materials['fire'].color;
        ctx.fillRect(state.fireX * state.gridSize, state.fireY * state.gridSize, state.gridSize, state.gridSize);
    }
}

function resizeCanvas(ctx, canvas, state, initGrid, draw) {
    canvas.width = window.innerWidth - 60;
    canvas.height = window.innerHeight;
    state.width = Math.floor(canvas.width / state.gridSize);
    state.height = Math.floor(canvas.height / state.gridSize);
    initGrid(state.grid, state.width, state.height);
    draw(ctx, canvas, state);
}

function explode(state, x, y) {
    const radius = 3;
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const dist = Math.sqrt(i * i + j * j);
            if (dist <= radius) {
                const newX = x + i;
                const newY = y + j;
                if (newX >= 0 && newX < state.width && newY >= 0 && newY < state.height) {
                    if (state.grid[newX][newY].type === 'gunpowder') {
                        state.grid[newX][newY] = { type: 'exploded', color: null, heat: state.grid[newX][newY].heat, pressure: state.grid[newX][newY].pressure }; // Mark as exploded
                        explode(state, newX, newY);
                    }
                    state.grid[newX][newY] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                }
            }
        }
    }
    state.shakeDuration = state.maxShakeDuration;
}

function initGrid(grid, width, height) {
    for (let x = 0; x < width; x++) {
        grid[x] = [];
        for (let y = 0; y < height; y++) {
            grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 }; // Initialize empty cells as vacuum
        }
    }
}

function spreadHeat(state, x, y) {
    if (state.grid[x][y].heat > 0) {
        if (x > 0 && state.grid[x - 1][y].heat < state.grid[x][y].heat) {
            state.grid[x - 1][y].heat = state.grid[x][y].heat - 1;
        }
        if (x < state.width - 1 && state.grid[x + 1][y].heat < state.grid[x][y].heat) {
            state.grid[x + 1][y].heat = state.grid[x][y].heat - 1;
        }
        if (y > 0 && state.grid[x][y - 1].heat < state.grid[x][y].heat) {
            state.grid[x][y - 1].heat = state.grid[x][y].heat - 1;
        }
        if (y < state.height - 1 && state.grid[x][y + 1].heat < state.grid[x][y].heat) {
            state.grid[x][y + 1].heat = state.grid[x][y].heat - 1;
        }
        state.grid[x][y].heat -= 0.1; // Heat dissipates over time
        if (state.grid[x][y].heat < 0) {
            state.grid[x][y].heat = 0;
        }
    }
}

function spreadPressure(state, x, y) {
    if (state.grid[x][y].pressure > 0) {
        if (x > 0 && state.grid[x - 1][y].pressure < state.grid[x][y].pressure) {
            state.grid[x - 1][y].pressure = state.grid[x][y].pressure;
        }
        if (x < state.width - 1 && state.grid[x + 1][y].pressure < state.grid[x][y].pressure) {
            state.grid[x + 1][y].pressure = state.grid[x][y].pressure;
        }
        if (y > 0 && state.grid[x][y - 1].pressure < state.grid[x][y].pressure) {
            state.grid[x][y - 1].pressure = state.grid[x][y].pressure;
        }
        if (y < state.height - 1 && state.grid[x][y + 1].pressure < state.grid[x][y].pressure) {
            state.grid[x][y + 1].pressure = state.grid[x][y].pressure;
        }
    }
}

function updateInfoPanel(state, x, y) {
    const block = state.grid[x][y];
    const blockTypeDisplay = document.getElementById('block-type');
    const blockHeatDisplay = document.getElementById('block-heat');
    const blockPressureDisplay = document.getElementById('block-pressure');

    blockTypeDisplay.textContent = `Type: ${block.type}`;
    blockHeatDisplay.textContent = `Heat: ${block.heat.toFixed(2)}`;
    blockPressureDisplay.textContent = `Pressure: ${block.pressure.toFixed(2)}`;
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}