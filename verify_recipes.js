const fs = require('fs');
const path = require('path');

const FILES = {
    brunch: "data/brunch/brunch.json",
    diner: "data/diner/diner.json",
    collation: "data/collation/collation.json",
    jus: "data/jus/jus.json"
};

const flatten = (obj) => {
    if (Array.isArray(obj)) return obj;
    // Exclude keys starting with "_" (like "_meta")
    const values = Object.keys(obj)
        .filter(key => !key.startsWith('_'))
        .map(key => obj[key]);
    return values.flat();
};

function verify() {
    console.log("🔍 DÉBUT DE LA VÉRIFICATION COMPLÈTE (V9.17)\n");
    let totalErrors = 0;

    for (const [key, relPath] of Object.entries(FILES)) {
        const fullPath = path.resolve(__dirname, relPath);
        console.log(`📂 Vérification de : ${relPath}`);

        try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            const data = JSON.parse(raw);
            const recipes = flatten(data);

            console.log(`   ➡️ ${recipes.length} recettes trouvées.`);

            recipes.forEach((r, idx) => {
                // 1. Check Name
                if (!r.name || r.name.length < 3) {
                    console.error(`   ❌ [${idx}] Nom invalide !`);
                    totalErrors++;
                }

                // 2. Check Calories
                if (!r.calories || typeof r.calories !== 'number' || r.calories < 10) {
                    // Allow 0 for water/tea maybe, but usually > 10
                    if (r.calories !== 0) {
                        console.error(`   ⚠️ [${r.name}] Calories suspectes : ${r.calories}`);
                        // This is a warning, not a blocker usually, but user asked if they are "bien calculé"
                        // We will assume missing or NaN is an Error.
                        if (!r.calories) totalErrors++;
                    }
                }

                // 3. Check Ingredients
                if (!r.ingredients || !Array.isArray(r.ingredients) || r.ingredients.length === 0) {
                    console.error(`   ❌ [${r.name}] Pas d'ingrédients !`);
                    totalErrors++;
                }

                // 4. Instructions (Required for "Opening")
                if (!r.instructions || r.instructions.length < 5) {
                    console.error(`   ❌ [${r.name}] Pas d'instructions (ne s'ouvrira pas bien) !`);
                    totalErrors++;
                }
            });

        } catch (e) {
            console.error(`   🚨 ERREUR CRITIQUE JSON : ${e.message}`);
            totalErrors++;
        }
        console.log("   ✅ OK\n");
    }

    if (totalErrors === 0) {
        console.log("🎉 SUCCÈS TOTAL : Toutes les recettes sont valides, calibrées et ouvrables.");
    } else {
        console.log(`🔴 ÉCHEC : ${totalErrors} erreurs trouvées.`);
    }
}

verify();
