const fs = require('fs');

const MEALS_FILE = 'data/meals.json';
const BAD_KEYWORDS = ['boeuf', 'poisson', 'steak', 'saumon', 'thon', 'cabillaud', 'navet', 'chou', 'haricot vert', 'brocoli', 'poulet', 'dinde', 'porc', 'agneau', 'sardine', 'maquereau', 'crevette'];

function audit() {
    const raw = fs.readFileSync(MEALS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    
    let flaggedCount = 0;
    
    data.recipes.forEach(r => {
        if (r.tags && r.tags.includes('petit-dej')) {
            const nameLower = r.name.toLowerCase();
            const bad = BAD_KEYWORDS.find(k => nameLower.includes(k));
            
            if (bad) {
                console.log(`[FLAG] ${r.name} (${bad}) - Removing 'petit-dej' tag`);
                r.tags = r.tags.filter(t => t !== 'petit-dej');
                // Ensure it has at least lunch/dinner if it had nothing else
                if (!r.tags.includes('lunch') && !r.tags.includes('dinner') && !r.tags.includes('snack')) {
                    r.tags.push('lunch');
                    r.tags.push('dinner');
                }
                flaggedCount++;
            }
        }
    });

    console.log(`Initial Audit Complete. Flagged & Fixed: ${flaggedCount}`);
    
    // Save back
    if (flaggedCount > 0) {
        fs.writeFileSync(MEALS_FILE, JSON.stringify(data, null, 2));
        console.log("File updated.");
    }
}

audit();
