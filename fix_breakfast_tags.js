const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/meals.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

const targetIds = [
    'crêpes_coco-riz_fourrées_banane',
    'tartine_houmous_&_concombre',
    'riz_au_lait_d’amande_coco',
    'bowl_fromage_blanc,_granola',
    'tartine_figue_chèvre_miel',
    'pain_perdu_brioché',
    'salade_de_fruits_&_menthe',
    'avocado_toast_grenade',
    'bagel_saumon_cream_cheese_(le_vrai)',
    'bagel_veggie_houmous_légumes_grillés'
];

let modifiedCount = 0;

data.recipes.forEach(r => {
    if (targetIds.includes(r.id)) {
        const oldTags = [...r.tags];
        // Remove lunch and dinner, keep others (petit-dej, vegan, etc.)
        r.tags = r.tags.filter(t => t !== 'lunch' && t !== 'dinner');

        if (oldTags.length !== r.tags.length) {
            console.log(`[FIXED] ${r.name}`);
            console.log(`        Before: ${oldTags.join(', ')}`);
            console.log(`        After:  ${r.tags.join(', ')}`);
            modifiedCount++;
        }
    }
});

if (modifiedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\nSuccessfully updated ${modifiedCount} recipes.`);
} else {
    console.log("No changes needed.");
}
