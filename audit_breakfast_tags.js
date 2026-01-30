const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/meals.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

const suspiciousKeywords = [
    'boeuf', 'bœuf', 'poulet', 'dinde', 'porc', 'veau', 'agneau',
    'saumon', 'thon', 'moule', 'crevette', 'poisson', 'sardine', 'maquereau',
    'riz', 'pate', 'pâte', 'spaghetti', 'nouille', 'soupe', 'velouté',
    'haricot', 'lentille', 'pois', 'chiche', 'oignon', 'ail', 'burger', 'pizza'
];

// Exemptions (Savory breakfast items that are okay)
const whitelist = [
    'toast', 'tartine', 'avocado', 'oeuf', 'egg', 'brouill', 'omelette',
    'pudding', 'bowl', 'porridge', 'pancake', 'wrap', 'bagel'
];

console.log("--- AUDIT OVERLAP START ---");

const overlapRecipes = data.recipes.filter(r => r.tags.includes('petit-dej') && r.tags.includes('dinner'));

overlapRecipes.forEach(r => {
    console.log(`[OVERLAP] ${r.name} (ID: ${r.id})`);
    console.log(`          Tags: ${r.tags.join(', ')}`);
});

console.log(`Total Overlap: ${overlapRecipes.length}`);
console.log("--- AUDIT END ---");
