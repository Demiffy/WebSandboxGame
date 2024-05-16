document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sandbox');
    const ctx = canvas.getContext('2d');
    const cursorHighlight = document.getElementById('cursor-highlight');
    const selectedElementDisplay = document.getElementById('selected-element');

    resizeCanvas(ctx, canvas, state, initGrid, draw);

    window.addEventListener('resize', () => {
        resizeCanvas(ctx, canvas, state, initGrid, draw);
    });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / state.gridSize) * state.gridSize;
        const y = Math.floor((event.clientY - rect.top) / state.gridSize) * state.gridSize;
        cursorHighlight.style.left = (x + 60) + 'px'; // Adjust for menu width
        cursorHighlight.style.top = y + 'px';

        state.lastMouseX = event.clientX - rect.left;
        state.lastMouseY = event.clientY - rect.top;

        const gridX = Math.floor(state.lastMouseX / state.gridSize);
        const gridY = Math.floor(state.lastMouseY / state.gridSize);
        if (gridX >= 0 && gridX < state.width && gridY >= 0 && gridY < state.height) {
            updateInfoPanel(state, gridX, gridY);
        }

        if (state.isMouseDown) {
            if (state.selectedMaterial === 'heat') {
                state.grid[gridX][gridY].heat += 10; // Add heat to the block
            } else if (state.selectedMaterial === 'pressure') {
                state.grid[gridX][gridY].pressure += 10; // Add pressure to the block
            } else if (state.selectedMaterial === 'fire') {
                if (state.fireX !== -1 && state.fireY !== -1 && (state.fireX !== gridX || state.fireY !== gridY)) {
                    state.fireX = -1;
                    state.fireY = -1;
                }
                if (gridX >= 0 && gridX < state.width && gridY >= 0 && gridY < state.height) {
                    state.fireX = gridX;
                    state.fireY = gridY;

                    // Interact with underlying blocks
                    if (state.grid[state.fireX][state.fireY].type === 'water') {
                        state.grid[state.fireX][state.fireY] = { type: 'steam', color: materials['steam'].color, heat: state.grid[state.fireX][state.fireY].heat, pressure: state.grid[state.fireX][state.fireY].pressure };
                        state.fireX = -1;
                        state.fireY = -1;
                    } else if (state.grid[state.fireX][state.fireY].type === 'wood') {
                        state.grid[state.fireX][state.fireY] = { type: 'burning_wood', color: materials['burning_wood'].color, heat: state.grid[state.fireX][state.fireY].heat, pressure: state.grid[state.fireX][state.fireY].pressure, burnStart: Date.now() };
                    } else if (state.grid[state.fireX][state.fireY].type === 'sand') {
                        state.grid[state.fireX][state.fireY] = { type: 'glass', color: materials['glass'].color, heat: state.grid[state.fireX][state.fireY].heat, pressure: state.grid[state.fireX][state.fireY].pressure };
                    } else if (state.grid[state.fireX][state.fireY].type === 'gunpowder') {
                        explode(state, state.fireX, state.fireY);
                        state.fireX = -1;
                        state.fireY = -1;
                    }

                    draw(ctx, canvas, state);
                }
            }
        }
    });

    canvas.addEventListener('mousedown', (event) => {
        state.isMouseDown = true;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / state.gridSize);
        const y = Math.floor((event.clientY - rect.top) / state.gridSize);
        if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
            if (state.selectedMaterial === 'remover') {
                state.grid[x][y] = { type: 'empty', color: null, heat: 0, pressure: -1 };
            } else if (state.selectedMaterial !== 'fire' && state.selectedMaterial !== 'heat' && state.selectedMaterial !== 'pressure') {
                state.grid[x][y] = { type: state.selectedMaterial, color: materials[state.selectedMaterial].color, heat: materials[state.selectedMaterial].heat, pressure: materials[state.selectedMaterial].pressure };
            }
        }
        draw(ctx, canvas, state); // Ensure the new block is drawn immediately
    });

    canvas.addEventListener('mouseup', () => {
        state.isMouseDown = false;
        if (state.fireX !== -1 && state.fireY !== -1) {
            state.fireX = -1;
            state.fireY = -1;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        state.isMouseDown = false;
        if (state.fireX !== -1 && state.fireY !== -1) {
            state.fireX = -1;
            state.fireY = -1;
        }
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            state.selectedMaterial = item.id;
            selectedElementDisplay.textContent = 'Selected: ' + state.selectedMaterial.charAt(0).toUpperCase() + state.selectedMaterial.slice(1);
        });
    });

    update(ctx, canvas, state);
});
