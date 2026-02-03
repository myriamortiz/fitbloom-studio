
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/meals.json', 'utf8'));
const recipes = data.recipes || [];

const ingredients = new Set();

recipes.forEach(r => {
    (r.ingredients || []).forEach(ingLine => {
        const name = ingLine.split(':')[0].trim();
        ingredients.add(name);
    });
});

const sorted = Array.from(ingredients).sort();
console.log(sorted.join('\n'));
