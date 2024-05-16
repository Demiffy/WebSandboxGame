const materials = {
    'sand': { color: '#f4e542', density: 2, heat: 0, pressure: 0 },
    'water': { color: '#00bfff', density: 1, heat: 0, pressure: 0 },
    'stone': { color: '#8c8c89', density: 3, heat: 0, pressure: 0 },
    'wood': { color: '#8B4513', density: 3, heat: 0, pressure: 0 },
    'burning_wood': { color: '#A52A2A', density: 3, heat: 500, pressure: 0, burnTime: 10000, spreadTime: 2000, burnStart: null },
    'dirt': { color: '#654321', density: 2, heat: 0, pressure: 0 },
    'fire': { color: '#ff4500', density: 0, heat: 1000, pressure: 0 },
    'steam': { color: '#c0c0c0', density: 0, heat: 100, pressure: 0 },
    'glass': { color: '#e0e0e0', density: 4, heat: 500, pressure: 0 },
    'gunpowder': { color: '#4f4f4f', density: 2, heat: 0, pressure: 0 },
    'vacuum': { color: null, density: 0, heat: 0, pressure: -1 },
    'heat': { color: null, density: 0, heat: 1000, pressure: 0 },
    'pressure': { color: null, density: 0, heat: 0, pressure: 100 }
};

let selectedMaterial = 'sand';
