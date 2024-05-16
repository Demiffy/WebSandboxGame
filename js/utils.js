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
    const currentBlock = state.grid[x][y];
    if (currentBlock.heat > 0) {
        const neighbors = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 }
        ];

        for (const { dx, dy } of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < state.width && ny >= 0 && ny < state.height) {
                const neighbor = state.grid[nx][ny];
                const conductivity = materials[currentBlock.type].heatConductivity;
                const deltaHeat = (currentBlock.heat - neighbor.heat) * conductivity;

                if (currentBlock.type === 'iron') {
                    // Iron blocks only absorb heat, do not transfer it out
                    if (neighbor.type !== 'iron') {
                        continue;
                    }
                } else if (neighbor.type === 'iron') {
                    // Transfer heat into iron blocks
                    neighbor.heat += deltaHeat;
                    currentBlock.heat -= deltaHeat;
                } else if (Math.abs(deltaHeat) > 0.01) {
                    neighbor.heat += deltaHeat;
                    currentBlock.heat -= deltaHeat;
                }
            }
        }

        // Adjust dissipation rate based on pressure
        let dissipationRate = 0.01; // Base dissipation rate
        if (currentBlock.pressure < 0) {
            dissipationRate = 0.1; // Higher dissipation rate for low pressure
        } else {
            dissipationRate /= (1 + currentBlock.pressure); // Lower dissipation rate for higher pressure
        }

        currentBlock.heat -= dissipationRate;
        if (currentBlock.heat < 0) {
            currentBlock.heat = 0;
        }

        // Check for melting
        if (materials[currentBlock.type].meltingPoint && currentBlock.heat >= materials[currentBlock.type].meltingPoint) {
            state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 }; // Melting the block
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

function drawHeatMap(ctx, state) {
    const maxHeat = 100; // Adjust this value based on the expected heat range in your simulation
    ctx.save();
    ctx.globalAlpha = 0.6; // Adjust transparency as needed

    for (let x = 0; x < state.width; x++) {
        for (let y = 0; y < state.height; y++) {
            const heat = state.grid[x][y].heat;
            if (heat > 0) { // Only visualize significant heat levels
                const intensity = Math.min(255, Math.floor((heat / maxHeat) * 255));
                ctx.fillStyle = `rgb(${intensity}, 0, 0)`; // Red color based on heat intensity
                ctx.fillRect(x * state.gridSize, y * state.gridSize, state.gridSize, state.gridSize);
            }
        }
    }
    ctx.restore();
}
