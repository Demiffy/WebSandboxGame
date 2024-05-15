document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sandbox');
    const ctx = canvas.getContext('2d');
    const cursorHighlight = document.getElementById('cursor-highlight');
    const selectedElementDisplay = document.getElementById('selected-element');

    const grid = [];
    const gridSize = 10; // 10x10 pixels per cell
    let width, height;

    const materials = {
        'sand': { color: '#f4e542', density: 2 },
        'water': { color: '#00bfff', density: 1 },
        'stone': { color: '#8c8c89', density: 3 }
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (grid[x][y].type !== 'empty') {
                    ctx.fillStyle = grid[x][y].color;
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                }
            }
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

    function update() {
        for (let x = 0; x < width; x++) {
            for (let y = height - 1; y >= 0; y--) {
                if (grid[x][y].type === 'sand') {
                    // Sand physics
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
        cursorHighlight.style.left = (x + 60) + 'px'; // Adjust for menu width
        cursorHighlight.style.top = y + 'px';
    });

    canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / gridSize);
        const y = Math.floor((event.clientY - rect.top) / gridSize);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (selectedMaterial === 'remover') {
                grid[x][y] = { type: 'empty', color: null };
            } else {
                grid[x][y] = { type: selectedMaterial, color: materials[selectedMaterial].color };
            }
        }
        draw(); // Ensure the new block is drawn immediately
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
