const materials = {
    'empty': { color: null, density: 0, heat: 0, pressure: -1, heatConductivity: 0.05 },
    'sand': { color: '#f4e542', density: 2, heat: 0, pressure: 0, heatConductivity: 0.2, meltingPoint: 1700 },
    'water': { color: '#00bfff', density: 1, heat: 0, pressure: 0, heatConductivity: 0.5 },
    'stone': { color: '#8c8c89', density: 3, heat: 0, pressure: 0, heatConductivity: 0.8 },
    'wood': { color: '#8B4513', density: 3, heat: 0, pressure: 0, heatConductivity: 0.1 },
    'burning_wood': { color: '#A52A2A', density: 3, heat: 500, pressure: 0, burnTime: 10000, spreadTime: 2000, burnStart: null, heatConductivity: 0.1 },
    'dirt': { color: '#654321', density: 2, heat: 0, pressure: 0, heatConductivity: 0.3 },
    'fire': { color: '#ff4500', density: 0, heat: 1000, pressure: 0, heatConductivity: 0.9 },
    'steam': { color: '#c0c0c0', density: 0, heat: 100, pressure: 0, heatConductivity: 0.1 },
    'glass': { color: '#e0e0e0', density: 4, heat: 0, pressure: 0, heatConductivity: 0.7, meltingPoint: 1500 },
    'gunpowder': { color: '#4f4f4f', density: 2, heat: 0, pressure: 0, heatConductivity: 0.2 },
    'vacuum': { color: null, density: 0, heat: 0, pressure: -1, heatConductivity: 0 },
    'heat': { color: null, density: 0, heat: 1000, pressure: 0, heatConductivity: 0.9 },
    'pressure': { color: null, density: 0, heat: 0, pressure: 100, heatConductivity: 0 },
    // Metals
    'iron': { color: '#B0C4DE', density: 7.8, heat: 0, pressure: 0, heatConductivity: 0.9, meltingPoint: 1538 },
    'copper': { color: '#B87333', density: 8.96, heat: 0, pressure: 0, heatConductivity: 0.95, meltingPoint: 1085 },
};

let selectedMaterial = 'sand';
