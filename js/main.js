function update(ctx, canvas, state) {
    const now = Date.now();
    for (let x = 0; x < state.width; x++) {
        for (let y = state.height - 1; y >= 0; y--) {
            if (state.grid[x][y].type === 'sand' || state.grid[x][y].type === 'gunpowder') {
                // Sand and gunpowder physics
                if (y < state.height - 1 && state.grid[x][y + 1].type === 'empty') {
                    state.grid[x][y + 1] = { ...state.grid[x][y] };
                    state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                } else if (y < state.height - 1 && state.grid[x][y + 1].type === 'water') {
                    state.grid[x][y + 1] = { ...state.grid[x][y] };
                    state.grid[x][y] = { type: 'water', color: materials['water'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
            } else if (state.grid[x][y].type === 'water') {
                // Water physics
                if (y < state.height - 1 && state.grid[x][y + 1].type === 'empty') {
                    state.grid[x][y + 1] = { ...state.grid[x][y] };
                    state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                } else if (x > 0 && y < state.height - 1 && state.grid[x - 1][y + 1].type === 'empty' && state.grid[x - 1][y].type === 'empty') {
                    state.grid[x - 1][y + 1] = { ...state.grid[x][y] };
                    state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                } else if (x < state.width - 1 && y < state.height - 1 && state.grid[x + 1][y + 1].type === 'empty' && state.grid[x + 1][y].type === 'empty') {
                    state.grid[x + 1][y + 1] = { ...state.grid[x][y] };
                    state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                }
            } else if (state.grid[x][y].type === 'fire') {
                // Fire interaction
                if (y > 0 && state.grid[x][y - 1].type === 'water') {
                    state.grid[x][y - 1] = { type: 'steam', color: materials['steam'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (y < state.height - 1 && state.grid[x][y + 1].type === 'water') {
                    state.grid[x][y + 1] = { type: 'steam', color: materials['steam'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (x > 0 && state.grid[x - 1][y].type === 'water') {
                    state.grid[x - 1][y] = { type: 'steam', color: materials['steam'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (x < state.width - 1 && state.grid[x + 1][y].type === 'water') {
                    state.grid[x + 1][y] = { type: 'steam', color: materials['steam'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (y > 0 && state.grid[x][y - 1].type === 'sand') {
                    state.grid[x][y - 1] = { type: 'glass', color: materials['glass'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (y < state.height - 1 && state.grid[x][y + 1].type === 'sand') {
                    state.grid[x][y + 1] = { type: 'glass', color: materials['glass'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (x > 0 && state.grid[x - 1][y].type === 'sand') {
                    state.grid[x - 1][y] = { type: 'glass', color: materials['glass'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (x < state.width - 1 && state.grid[x + 1][y].type === 'sand') {
                    state.grid[x + 1][y] = { type: 'glass', color: materials['glass'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure };
                }
                if (y > 0 && state.grid[x][y - 1].type === 'gunpowder') {
                    explode(state, x, y - 1);
                }
                if (y < state.height - 1 && state.grid[x][y + 1].type === 'gunpowder') {
                    explode(state, x, y + 1);
                }
                if (x > 0 && state.grid[x - 1][y].type === 'gunpowder') {
                    explode(state, x - 1, y);
                }
                if (x < state.width - 1 && state.grid[x + 1][y].type === 'gunpowder') {
                    explode(state, x + 1, y);
                }
            } else if (state.grid[x][y].type === 'wood') {
                // Wood to burning wood
                if (state.grid[x][y].burnStart && now - state.grid[x][y].burnStart >= 2000) {
                    state.grid[x][y] = { type: 'burning_wood', color: materials['burning_wood'].color, heat: state.grid[x][y].heat, pressure: state.grid[x][y].pressure, burnStart: now };
                }
            } else if (state.grid[x][y].type === 'burning_wood') {
                // Burning wood spread and burn out
                if (now - state.grid[x][y].burnStart >= materials['burning_wood'].burnTime) {
                    state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                } else if (now - state.grid[x][y].burnStart >= materials['burning_wood'].spreadTime) {
                    if (y > 0 && state.grid[x][y - 1].type === 'wood' && !state.grid[x][y - 1].burnStart) {
                        state.grid[x][y - 1].burnStart = now;
                    }
                    if (y < state.height - 1 && state.grid[x][y + 1].type === 'wood' && !state.grid[x][y + 1].burnStart) {
                        state.grid[x][y + 1].burnStart = now;
                    }
                    if (x > 0 && state.grid[x - 1][y].type === 'wood' && !state.grid[x - 1][y].burnStart) {
                        state.grid[x - 1][y].burnStart = now;
                    }
                    if (x < state.width - 1 && state.grid[x + 1][y].type === 'wood' && !state.grid[x + 1][y].burnStart) {
                        state.grid[x + 1][y].burnStart = now;
                    }
                }
            } else if (state.grid[x][y].type === 'steam') {
                // Steam rising slowly
                if (Math.random() < 0.1) {
                    if (y > 0 && state.grid[x][y - 1].type === 'empty') {
                        state.grid[x][y - 1] = { ...state.grid[x][y] };
                        state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                    } else if (x > 0 && y > 0 && state.grid[x - 1][y - 1].type === 'empty') {
                        state.grid[x - 1][y - 1] = { ...state.grid[x][y] };
                        state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                    } else if (x < state.width - 1 && y > 0 && state.grid[x + 1][y - 1].type === 'empty') {
                        state.grid[x + 1][y - 1] = { ...state.grid[x][y] };
                        state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
                    }
                }
            }

            // Spread heat and pressure
            spreadHeat(state, x, y);
            spreadPressure(state, x, y);
        }
    }

    draw(ctx, canvas, state);

    const rect = canvas.getBoundingClientRect();
    const gridX = Math.floor(state.lastMouseX / state.gridSize);
    const gridY = Math.floor(state.lastMouseY / state.gridSize);
    if (gridX >= 0 && gridX < state.width && gridY >= 0 && gridY < state.height) {
        updateInfoPanel(state, gridX, gridY);
    }

    // Draw heat map if the checkbox is checked
    const heatmapCheckbox = document.getElementById('heatmap-checkbox');
    if (heatmapCheckbox.checked) {
        drawHeatMap(ctx, state);
    }

    requestAnimationFrame(() => update(ctx, canvas, state));
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sandbox');
    const ctx = canvas.getContext('2d');

    update(ctx, canvas, state);
});

document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.menu-category');

    categories.forEach(category => {
        category.addEventListener('click', () => {
            const categoryId = category.id + '-content';
            const content = document.getElementById(categoryId);
            const isExpanded = content.classList.contains('expanded');

            if (isExpanded) {
                const startHeight = content.scrollHeight;
                content.style.height = startHeight + 'px';
                requestAnimationFrame(() => {
                    content.style.height = '0';
                });
                content.classList.remove('expanded');
            } else {
                const startHeight = content.scrollHeight;
                content.style.height = '0';
                requestAnimationFrame(() => {
                    content.style.height = startHeight + 'px';
                });
                content.classList.add('expanded');
                content.addEventListener('transitionend', () => {
                    content.style.height = 'auto';
                }, { once: true });
            }

            category.classList.toggle('selected', !isExpanded);
        });
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('selected'));
            item.classList.add('selected');
            selectedMaterial = item.id;
            document.getElementById('selected-element').innerText = `Selected: ${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`;
        });
    });
});
